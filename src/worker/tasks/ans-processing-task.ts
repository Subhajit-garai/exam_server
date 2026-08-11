import { BaseWorkerTask } from "./base-task.js";
import { examAnsManager } from "../helper/ExamAnsProcessor.js";
import { question_ans_db_save_formt } from "../helper/types/ans-prossing-types.js";

// src/workers/ans-processing-task.ts
export class AnsProcessingTask extends BaseWorkerTask {
  async execute(): Promise<void> {
    console.log("Running AnsProcessingTask with data:", this.task.payload);

    try {
      let AnsManager = examAnsManager.getInstance();

      let { examid, userid, part, ans, ismultiple, number } = this.task.payload;

      let responce = await AnsManager.setUserans(this.task.payload, 14400);

      let key = `examquestion:${examid}:${part}:${number}`;

      let question_data = await AnsManager.getQuestionInfoFromCatch(key);

      if (!question_data) throw Error("question Data not found");

      // console.log("----> data -->", question_data);

      //  {
      //       type: "AnsProcessing";
      //       examid: string;
      //       userid: string;
      //       part: string;
      //       ans: string[];
      //       number: string;
      //       ismultiple: boolean;
      //     }

      let { question } = question_data;

      let userAnsDbSaveFormat: question_ans_db_save_formt = {
        examid: examid,
        userid: userid,
        questionid: question.id,
        shuffleMap: question.map,
        selectedOption: ans,
      };

      let responsOfDbStorage =
        await AnsManager.setUserAnsIntoDb(userAnsDbSaveFormat);

      if (!responsOfDbStorage) {
        // push in to queue again
      }

      console.log("handleAns ---> ", responce);
    } catch (error) {
      console.log("error in task manager handleAns ", error);
    }
  }
}
