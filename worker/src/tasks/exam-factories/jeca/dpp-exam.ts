



// src/exam-factories/jeca/dpp-exam.ts
import { exam_pattern } from "@/lib/types/types";
import { Network } from "../../../utils/network";
import { IExamCreator } from "../base-exam";
import { examQuestionManger, SelectQuestion_type } from "@/lib/ExamQuestionProcessor";
import { logger } from "@/utils/logger";

export class JecaDppExam implements IExamCreator {
  constructor(private payload: any) { }

  async run(): Promise<void> {
    console.log("🧾 Creating JECA DPP Exam:", this.payload);

    let newtWorkClient = Network.getInstance();
    let QuestionManagerClient = examQuestionManger.getInstance();

    let finalquestions: any = {};

    let { examid } = this.payload;

    let examptternId = await newtWorkClient.getExamPatternId(examid);

    let exampattern: exam_pattern = await newtWorkClient.getExamPattern(
      examptternId
    );

    if (!exampattern) {
      throw Error("exam pattern not found ");
    }

    let { topics, total_questions, is_multiple_ans, syllabus, syllabusid } =
      exampattern;

    if (syllabus === "Syllabus") {
      if (!syllabusid) {
        throw Error("exam pattern's syllabusid not found ");
      }

      let syllabus_data: (string | null)[] =
        await newtWorkClient.getSyllabusDataForExamCreattion(syllabusid);


      logger.info(syllabus_data)

      syllabus_data.map((subject) => {
        if (subject) {
          topics.push(subject);
        } else {
          throw Error(
            "----RED---- subject short Name Null recive and ignoring it for Exam question selection"
          );
        }
      });
    } else {
      console.log("generic type exam");
    }
    // here syllabus is enum syllabus  or Gereric

    // total_questions = [80 ,20] count
    let promises = total_questions.map(
      async (question: number, index: number) => {

        let data = await QuestionManagerClient.selectQuestions(
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

    let responce = await QuestionManagerClient.AddQuestionsIntoExam(
      examid,
      finalquestions
    );
    // add ansset
    if (responce) {
      console.log("exam Question added");

      // request to update exam status

      let status = await newtWorkClient.examQuestionAddedStatusChange(examid);
      if (status) {
        // send notification
      }

      // this.getredisClient().push({
      //   type: "Notify",
      //   status: true,
      //   data: { examid: examid },
      //   message: "exam created",
      // });
      console.log("added notification");
    } else {
      console.log(" notification not updated");
      // i can a fn fron send message to admin via backend and tel-bot
    }
  }
}
