// src/workers/create-score-task.ts

import { BaseWorkerTask } from "./base-task.js";

import { ansType, Right_Wrong_set_type, Task } from "@/lib/types/types.js";
import { examAnsManager } from "@/lib/ExamAnsProcessor.js";
import { exam_question_format_type } from "@/lib/types/ans-prossing-types.js";
import { logger } from "@/utils/logger.js";

export function validateOption(
  ans: string[],
  userAns: string[],
  map: number[],
  isMultipleAns: boolean = false
) {
  if (isMultipleAns) {
    let selectedOptions = userAns.map((ans) => {
      return map[parseInt(ans) - 1];
    });

    return selectedOptions.every((item) => ans.includes(String(item)));
  } else {
    const originalIndex = map[parseInt(userAns[0]) - 1];
    if (parseInt(ans[0]) === originalIndex) {
      return true;
    }
    return false;
  }
}

export class CreateScoreTask extends BaseWorkerTask {
  async execute(): Promise<void> {
    console.log("Running CreateScoreTask with data:", this.task.payload);

    let ansprocessorClient = examAnsManager.getInstance();

    let { examid, userid } = this.task.payload;

    let ANS_SET_EXAM_AND_USER_GIVEN =
      await ansprocessorClient.getUserAndExamAns(examid, userid);

    /* { number: { ans: ["1"], part: 'part1' } } */

    if (!ANS_SET_EXAM_AND_USER_GIVEN)
      throw Error(
        `user or exam ans set not recived for examid ${examid} or userid ${userid}`
      );

    let examAns = ANS_SET_EXAM_AND_USER_GIVEN[0];
    let userAns = ANS_SET_EXAM_AND_USER_GIVEN[1];
    // exam pattern needed
    let exam_pattern = await ansprocessorClient.getExamPatternFormStore(examid);

    let SCORE = 0;
    let UNATTEMPT = 0;
    let WRONG = 0;
    let RIGHT = 0;
    let RIGHT_WRONG: Right_Wrong_set_type = {};
    let topic_wise_R_W: Right_Wrong_set_type = {}; // it calculate how much wrong in topic wise , and it build weakness metrix

    // done
    let { is_multiple_ans } = exam_pattern;
    const filteredExamAns: Record<string, ansType[]> = {};

    examAns.forEach((q: any) => {
      if (!filteredExamAns[q.part]) {
        filteredExamAns[q.part] = [];
      }
      filteredExamAns[q.part].push(q);
    });

    await Promise.all(
      Object.keys(filteredExamAns).map(async (part, i: number) => {
        let questions = await ansprocessorClient.getQuestionsInfoFromCatch(
          examid,
          userid,
          part
        );

        if (!questions) throw Error("questions not found");

        filteredExamAns[part].map((ans: any) => {
          let numberid = ans.id;
          let question = questions[parseInt(numberid)];
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

                if (!question.question?.map)
                  throw Error("question.question.question?.map not found");

                let result = validateOption(
                  ans.ans,
                  user_ans_array,
                  question.question?.map,
                  true
                );

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
                console.log("single ans check");
                if (!question.question?.map)
                  throw Error("question.question.question?.map not found");
                let result = validateOption(
                  ans.ans,
                  user_ans,
                  question.question?.map
                );
                if (result) {
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
      })
    );

    let { part, marks_values, neg_values, total_questions } = exam_pattern;

    if (part) {
      let num;
      Object.keys(RIGHT_WRONG).map((p, i: number) => {
        let part = `part${i + 1}`;
        let neg_marking =
          parseInt(neg_values[i]) < 1
            ? 0
            : RIGHT_WRONG[part].Wrong / parseInt(neg_values[i]);
        num = RIGHT_WRONG[part].Right * parseInt(marks_values[i]) - neg_marking; // parseInt(neg_values[i]) < 1 ? 1 :
        SCORE += num < 0 ? 0 : num;
      });
    } else {
      let num =
        RIGHT_WRONG["part1"]?.Right * marks_values[0] -
        RIGHT_WRONG["part1"]?.Wrong /
          (parseInt(neg_values[0]) < 1 ? 1 : parseInt(neg_values[0]));
      SCORE += num < 0 ? 0 : num;
    }

    console.log(`${SCORE} score , ${WRONG} wrong ,${RIGHT} right`);

    // add score in to db
    let all_parts_total_questions: number = total_questions.reduce(
      (sum: number, question: number) => sum + question,
      0
    );

    let status = await ansprocessorClient.setUserScore(
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

      // add to queue

      console.log("CreateScore task add into queue");
    } else {
      console.log("score add into db");
    }
  }
}
