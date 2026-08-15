import { Questions_type, Task } from "@/lib/types/types.js";
import { BaseWorkerTask } from "./base-task.js";
import { BotService } from "@/app/bot/bot.service.js";
import { CreationTypes } from "@/db/enums.js";
import _ from "lodash";

// src/workers/ans-processing-task.ts
export class MockProcessingTask extends BaseWorkerTask {
  async execute(): Promise<void> {
    console.log("Running MockProcessingTask with data:", this.task.payload);

    // Your logic here

    const botService = new BotService();

    let { examid, action } = this.task.payload;

    let questionCount: number[] = [];
    let parts = [];
    let ismultiple_part = false;
    let Mock_Questions: Questions_type = {};
    let difficulty_count = { Easy: 0, Medium: 0, Hard: 0 };
    let topic_wise_count: { [key: string]: number } = {}; //{ "OS": 0, "DBMS": 0, "C": 0 }
    let question_part_count: { [key: string]: number } = {}; // { "part1": 0, "part2": 0 }
    let isprocessingDone = false;
    let MockSet_Status: CreationTypes = "Suspended";
    let isError = false; // if error true then status suspended

    const mockSet: any = await botService.exam.setMockQuestionSetStatus(
      examid,
      "Processing",
    );

    if (mockSet) {
      let exam_info = await botService.exam.getMockSetExamPattern(examid);

      if (!exam_info) {
        new Error("exam_pattern_info not found");
      }

      let MockSetQuestion = await botService.exam.getQuestionsInfoForExam(
        mockSet.id,
      );

      // question count checking
      if (!MockSetQuestion) new Error("questions not found in mock set");

      MockSetQuestion.map((questionInfo) => {
        if (!Mock_Questions[questionInfo.part])
          Mock_Questions[questionInfo.part] = [];

        Mock_Questions[questionInfo.part].push(questionInfo.questionid);
      });

      // Mock_Questions = mockSet?.questions as Questions_type;

      if (exam_info?.exam_pattern.total_questions.length > 1) {
        // is pattern have multiple parts
        if (!(Object.keys(Mock_Questions).length > 1)) {
          throw new Error(
            `Exam pattern have multiple part , but current mock set doesnot have multiple part . part length is --->${
              Object.keys(Mock_Questions).length
            }`,
          );
        }

        ismultiple_part = true;
      }

      // setting part info
      parts = Object.keys(Mock_Questions);

      for (const part of parts) {
        let questions = Mock_Questions[part];
        // done
        if (questions.length > 0) {
          let questionFullInfo =
            await botService.exam.getQuestionDetailsForBot(questions);

          questionFullInfo.map((question) => {
            if (!question_part_count[part]) {
              question_part_count[part] = 0;
            }
            question_part_count[part] += 1;

            if (question.difficulty) {
              difficulty_count[question.difficulty] += 1;
            }
            if (question.Topic) {
              if (!topic_wise_count[question.Topic.name]) {
                topic_wise_count[question.Topic.name] = 0;
              }
              topic_wise_count[question.Topic.name] += 1;

              // check other topic not added
              // if (!exam_info.exam_pattern.topics.includes(question.Topic.name)) {
              //   isError = true;
              //   console.log("unkown topic found in mock set question ....");
              // }
            }
          });
          questionCount.push(question_part_count[part]);
        }
      }

      // comparing the mock set info count

      exam_info?.exam_pattern.total_questions.map(
        (num: number, index: number) => {
          if (num !== questionCount[index]) {
            console.log(" ----> ", num, questionCount[index], questionCount);

            console.error("question count is not matching for", index + 1);
          } else {
            console.log("question count is matching for", index + 1);
          }
        },
      );

      isprocessingDone = true;

      // console.log("questionCount is ", questionCount);
      // console.log("question_part_count is ", question_part_count);
      // console.log("topic_wise_count is ", topic_wise_count);
      // console.log("difficulty_count is ", difficulty_count);

      // all  topic added or not
      // if (
      //   !_.isEqual(
      //     [...exam_info.exam_pattern.topics].sort(),
      //     Object.keys(topic_wise_count).sort()
      //   )
      // ) {
      //   // console.log("---- topic ----> ", [...exam_info.exam_pattern.topics].sort());
      //   // console.log("----  ----> ", topic_wise_count);
      //   // console.log("----  ----> ", Object.keys(topic_wise_count).sort());

      //   console.log(
      //     "In mock set's some topic's questions are not present  .. "
      //   );

      //   isError = true;
      // }

      // check if all topic question are add at list one
      if (!Object.values(topic_wise_count).every((val) => val >= 1)) {
        console.log(
          " In mock set's some topic is empty add at leat 1 question per topic .. ",
        );
        isError = true;
      }

      // check question count
      if (!_.isEqual(exam_info.exam_pattern.total_questions, questionCount)) {
        console.log("mock set's question count is not equel .. ");
        isError = true;
      }
      console.log(" error ---->", isError);

      if (!isError) {
        const mockSet: any = await botService.exam.setMockQuestionSetStatus(
          examid,
          "Done",
        );
      }
    }
  }
}
