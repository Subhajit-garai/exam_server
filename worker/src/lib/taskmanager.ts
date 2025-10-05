import axios from "axios";
import _ from "lodash";

import { ExamAnsProcessor } from "./ExamAnsProcessor";
import {
  ExamQuestionProcessor,
  SelectQuestion_type,
} from "./ExamQuestionProcessor";
import { RedisProvider } from "./radisProvider";
import {
  ansType,
  Right_Wrong,
  Right_Wrong_set_type,
  Task,
} from "./types/types";
import fs from "fs";
import { CreationTypes, Network } from "../utils/network";
import { debuglog } from "../utils/debugLog";
import { waitForSomeThink } from "./delay";

// types

export type Questions_type = { [part: string]: string[] };
export type diffcultlevel = "Easy" | "Medium" | "Hard";
export type QuestionStatus =
  | "Created"
  | "Processing"
  | "Done"
  | "Duplicate"
  | "Suspended"
  | "Close";
export type Question_Data_type = {
  id: string;
  title: string;
  sub_topic: string;
  topic: string;
  explanation: string | null;
  is_multiple_ans: boolean;
  difficulty: diffcultlevel;
  status: QuestionStatus;
};

export const writeJsondata = (
  data: object[] | object,
  path: string,
  append: boolean = false
): boolean => {
  const jsonData = JSON.stringify(data, null, 2);
  const options: fs.WriteFileOptions = append ? { flag: "a" } : null;
  let status: boolean = true;
  fs.writeFile(path || "data.json", jsonData, options, (err) => {
    if (err) {
      console.log("Error writing to file:", err);
      status = false;
    } else {
      console.log("Data successfully written to file");
    }
  });

  return status;
};

export class taskmanager {
  private static instance: taskmanager;
  private questionprocessor: ExamQuestionProcessor;
  private ansprocessor: ExamAnsProcessor;
  private redisclient: RedisProvider;
  private Network: Network;

  public static getInstance() {
    if (!this.instance) {
      this.instance = new taskmanager();
    }
    return this.instance;
  }

  private constructor() {
    this.questionprocessor = ExamQuestionProcessor.getInstance(5);
    this.ansprocessor = ExamAnsProcessor.getInstance();
    this.redisclient = RedisProvider.getInstance();
    this.Network = Network.getInstance();
  }

  getredisClient() {
    return this.redisclient;
  }

  async ProcessMockset(data: Task) {
    try {
      if (data.type === "MockSetProcessing") {
        let { mockid, action } = data;

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

        const mockSet = await this.Network.setMockQuestionSetStatus(
          mockid,
          "Processing"
        );
        if (mockSet) {
          let exam_pattern_info =
            await this.Network.getMockSetPatternInfobyTitle(mockSet.pattern);

          if (!exam_pattern_info) {
            return new Error("exam_pattern_info not found");
          }

          let MockSetQuestion = await this.Network.getMockQuestionSet(
            mockSet.id
          );

          // question count checking
          if (!MockSetQuestion)
            return new Error("questions not found in mock set");

          MockSetQuestion.map((questionInfo: any) => {
            if (!Mock_Questions[questionInfo.part])
              Mock_Questions[questionInfo.part] = [];

            Mock_Questions[questionInfo.part].push(questionInfo.questionid);
          });

          // Mock_Questions = mockSet?.questions as Questions_type;

          if (exam_pattern_info?.total_questions.length > 1) {
            // is pattern have multiple parts
            if (!(Object.keys(Mock_Questions).length > 1)) {
              throw new Error(
                `Exam pattern have multiple part , but current mock set doesnot have multiple part . part length is --->${
                  Object.keys(Mock_Questions).length
                }`
              );
            }

            ismultiple_part = true;
          }

          // setting part info
          parts = Object.keys(Mock_Questions);

          for (const part of parts) {
            debuglog("loop1");
            let questions = Mock_Questions[part];
            // done

            if (questions.length > 0) {
              let questionFullInfo: Question_Data_type[] =
                await this.Network.getQuestionViaids(questions);

              questionFullInfo.map((question) => {
                if (!question_part_count[part]) {
                  question_part_count[part] = 0;
                }
                question_part_count[part] += 1;

                if (question.difficulty) {
                  difficulty_count[question.difficulty] += 1;
                }
                if (question.topic) {
                  if (!topic_wise_count[question.topic]) {
                    topic_wise_count[question.topic] = 0;
                  }
                  topic_wise_count[question.topic] += 1;

                  // check other topic not added
                  if (!exam_pattern_info.topics.includes(question.topic)) {
                    isError = true;
                    console.log("unkown topic found in mock set question ....");
                  }
                }
              });
              questionCount.push(question_part_count[part]);
            }
          }

          // comparing the mock set info count

          exam_pattern_info?.total_questions.map(
            (num: number, index: number) => {
              debuglog("loop3");

              if (num !== questionCount[index]) {
                console.error("question count is not matching for", index + 1);
              } else {
                console.log("question count is matching for", index + 1);
              }
            }
          );

          isprocessingDone = true;

          await waitForSomeThink(() => {
            console.log("=====> ", isprocessingDone);
            return isprocessingDone;
          }, 3);

          console.log("questionCount is ", questionCount);
          console.log("question_part_count is ", question_part_count);
          console.log("topic_wise_count is ", topic_wise_count);
          console.log("difficulty_count is ", difficulty_count);

          // all  topic added of not
          if (
            !_.isEqual(
              [...exam_pattern_info.topics].sort(),
              Object.keys(topic_wise_count).sort()
            )
          ) {
            console.log(
              "---- topic ----> ",
              [...exam_pattern_info.topics].sort()
            );
            console.log("----  ----> ", topic_wise_count);
            console.log("----  ----> ", Object.keys(topic_wise_count).sort());

            console.log(
              "In mock set's some topic's questions are not present  .. "
            );
            isError = true;
          }
          // check if all topic question are add at list one
          if (!Object.values(topic_wise_count).every((val) => val >= 1)) {
            console.log(
              " In mock set's some topic is empty add at leat 1 question per topic .. "
            );
            isError = true;
          }

          // check question count
          if (!_.isEqual(exam_pattern_info.total_questions, questionCount)) {
            console.log("mock set's question count is not equel .. ");
            isError = true;
          }

          // if those checks are ok , then add status : done

          // store data
          console.log(" error ---->", isError);

          if (!isError) {
            MockSet_Status = "Done";
          }

          // need to add task for ording question --> when all question is add 

          // const UpdatedmockSet = await prisma.mock_questions_set.update({
          //   where: { id },
          //   data: {
          //     question_part_count: question_part_count,
          //     status: MockSet_Status,
          //     question_topic_count: topic_wise_count,
          //     selected_questions_count: questionCount,
          //     question_difficulty_weight: difficulty_count,
          //   },
          // });


          // then add task to order and then update status of mock

          // order mockset Question


          // if (UpdatedmockSet) {
          //   console.log("completed   ...");
          // }
        }
      }
    } catch (errer) {
      console.log("error in task manager ProcessMockset ");
    }
  }

  // done

  async handleExamCreation(data: Task) {
    try {
      let ans_array: string[] = [];
      let finalquestions: any = {};

      if (data.type === "CreateExam") {
        let { examid, examtype } = data;
        let examptternId = await this.Network.getExamPatternId(examid);
        let exampattern = await this.Network.getExamPattern(examptternId);
        debuglog(examptternId)

        debuglog("exam pattern is ");
        debuglog(exampattern);
        let { topics, total_questions, is_multiple_ans } = exampattern;

        let promises = total_questions.map(
          async (question: number, index: number) => {
            let data = await this.questionprocessor.selectQuestions(
              question,
              topics,
              is_multiple_ans[index]
            );
            let Question_array: string[] = [];

            Object.keys(data as SelectQuestion_type).map((d) => {
              data &&
                data[d].map((ele) => {
                  Question_array.push(ele);
                });
            });
            return (finalquestions[`part${index + 1}`] = Question_array);
          }
        );
        await Promise.all(promises);

        let responce = await this.questionprocessor.AddQuestionsIntoExam(
          examid,
          finalquestions
        );
        // add ansset
        console.log("responce of  add question into Exam", responce);

        if (responce) {
          console.log("exam Question added");
          this.getredisClient().push({
            type: "Notify",
            status: true,
            data: { examid: examid },
            message: "exam created",
          });
          console.log("added notification");
        } else {
          console.log(" notification not updated");
          // i can a fn fron send message to admin via backend and tel-bot
        }
      }
    } catch (error) {
      console.log("error in task manager handleExam ", error);
    }
  }
  async handleScore(data: Task) {
    try {
      if (data.type === "CreateScore") {
        // get exam's ans or question id for serching /getting user

        let { examid, userid } = data;

        let ANS_SET_EXAM_AND_USER_GIVEN =
          await this.ansprocessor.getUserAndExamAns(examid, userid);

        /* { number: { ans: ["1"], part: 'part1' } } */

        if (!ANS_SET_EXAM_AND_USER_GIVEN) return 0;

        let examAns = ANS_SET_EXAM_AND_USER_GIVEN[0];
        let userAns = ANS_SET_EXAM_AND_USER_GIVEN[1];
        // exam pattern needed
        let exam_pattern = await this.ansprocessor.getExamPatternFormStore(
          examid
        );

        let SCORE = 0;
        let UNATTEMPT = 0;

        let WRONG = 0;
        let RIGHT = 0;
        let RIGHT_WRONG: Right_Wrong_set_type = {};
        let topic_wise_R_W: Right_Wrong_set_type = {}; // it calculate how much wrong in topic wise , and it build weakness metrix

        function validateOption(ans: string[], userAns: string[]) {
          return userAns.every((item) => ans.includes(item)) ? 1 : 0;
        }

        // done

        let { is_multiple_ans } = exam_pattern;

        const filteredExamAns: Record<string, ansType[]> = {};

        examAns.forEach((q: any) => {
          if (!filteredExamAns[q.part]) {
            filteredExamAns[q.part] = [];
          }
          filteredExamAns[q.part].push(q);
        });

        // console.log("filteredExamAns " ,filteredExamAns);
        // console.log("userAns " ,userAns);

        Object.keys(filteredExamAns).map((part, i: number) => {
          filteredExamAns[part].map((ans: any) => {
            let numberid = ans.id;
            let topic = ans.topic;
            let PART = ans.part;
            if (!RIGHT_WRONG[PART]) {
              RIGHT_WRONG[PART] = { Right: 0, Wrong: 0 }; // Initialize if not exists
            }
            if (!topic_wise_R_W[topic]) {
              topic_wise_R_W[topic] = { Right: 0, Wrong: 0 }; // Initialize if not exists
            }

            if (userAns[numberid]) {
              let { ans: user_ans, part } = userAns[numberid];

              if (PART == part) {
                // multiple ans checking
                if (is_multiple_ans[i]) {
                  console.log("multiple ans");
                  // console.log("user ans for " , id , " is " , user_ans , " and part is --> " ,part , "is multiple ans " ,is_multiple_ans[i],"ans is " , ans.ans );
                  let user_ans_array = user_ans.split(",");
                  let result = validateOption(ans.ans, user_ans_array);

                  if (result) {
                    let buff = user_ans_array.length / ans.ans.length;
                    topic_wise_R_W[topic].Right += 1;
                    RIGHT_WRONG[PART].Right += buff;
                    ++RIGHT;
                  } else {
                    topic_wise_R_W[topic].Wrong += 1;
                    ++WRONG;
                  }
                } else {
                  let ANS = ans.ans[0];
                  if (ANS == user_ans) {
                    topic_wise_R_W[topic].Right += 1;
                    RIGHT_WRONG[PART].Right += 1;
                    ++RIGHT;
                  } else {
                    topic_wise_R_W[topic].Wrong += 1;
                    RIGHT_WRONG[PART].Wrong += 1;
                    ++WRONG;
                  }
                }
              }
            } else {
              UNATTEMPT += 1;
            }
          });
        });

        let { part, marks_values, neg_values, total_questions } = exam_pattern;

        if (part) {
          let num;
          Object.keys(RIGHT_WRONG).map((p, i: number) => {
            let part = `part${i + 1}`;
            let neg_marking =
              parseInt(neg_values[i]) < 1
                ? 0
                : RIGHT_WRONG[part].Wrong / parseInt(neg_values[i]);
            num =
              RIGHT_WRONG[part].Right * parseInt(marks_values[i]) - neg_marking; // parseInt(neg_values[i]) < 1 ? 1 :
            SCORE += num < 0 ? 0 : num;
          });
        } else {
          let num =
            RIGHT_WRONG["part1"].Right * marks_values[0] -
            RIGHT_WRONG["part1"].Wrong /
              (parseInt(neg_values[0]) < 1 ? 1 : parseInt(neg_values[0]));
          SCORE += num < 0 ? 0 : num;
        }

        console.log(`${SCORE} score , ${WRONG} wrong ,${RIGHT} right`);

        // add score in to db
        let all_parts_total_questions: number = total_questions.reduce(
          (sum: number, question: number) => sum + question,
          0
        );

        let status = await this.ansprocessor.setUserScore(
          examid,
          userid,
          SCORE,
          UNATTEMPT,
          RIGHT_WRONG,
          topic_wise_R_W,
          all_parts_total_questions
        );

        if (!status) {
          // add this task in queue again if any error
          let task: Task = {
            type: "CreateScore",
            examid: examid,
            userid: userid,
          };
          // add to queue

          console.log("CreateScore task add into queue");
        } else {
          console.log("score add into db");
        }
      }
    } catch (error) {
      console.log("error in task manager handleScore ", error);
    }
  }

  async handleAns(data: Task) {
    try {
      if (data.type === "AnsProcessing") {
        let responce = await this.redisclient.setUserans(data, 14400);
        console.log("handleAns ---> ", responce);
      }
    } catch (error) {
      console.log("error in task manager handleAns ", error);
    }
  }

  // not touched
  async handleQuiz(Data: Task) {
    try {
      if (Data.type === "createQuiz") {
        let {
          totalQuetions,
          chatid,
          userid,
          topics,
          cburl,
          nextQuestionTime,
          quizOpenFor,
          ismultiple,
          thread_id,
          quizid,
        } = Data;

        let data = await this.questionprocessor.selectQuestions(
          totalQuetions,
          topics,
          ismultiple // is_multiple_ans
        );
        let Question_array: string[] = [];


        Object.keys(data as SelectQuestion_type).map((d) => {
          data &&
            data[d].map((ele) => {
              Question_array.push(ele);
            });
        });

        let finalquestions = await this.Network.getQuestions_byIds(Question_array);
        if (finalquestions) {
          console.log("finalquestions are collected , ready to send to bot");
        }

        // logic for webhook

        let webhook_url = cburl;
        let processed_data = {
          type: "quizquestionset",
          questions: finalquestions,
          config: {
            chatid: chatid,
            thread_id: thread_id,
            userid: userid,
            topics: topics,
            totalQuetions: totalQuetions,
            nextQuestionTime: nextQuestionTime,
            quizOpenFor: quizOpenFor,
          },
        };

        // console.log("processData ---> ", processed_data);

        let request = await axios.post(webhook_url, processed_data, {
          headers: {
            "Content-Type": "application/json",
            Authorization: "token here ",
          },
        });

        if (request.status === 200) {
          console.log("webhook sent successfully");
        }
      }
    } catch (error) {
      console.log("error in task manager handleQuiz ", error);
    }
  }
}
