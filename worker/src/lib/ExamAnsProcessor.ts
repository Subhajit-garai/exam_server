import {
  AnsKeysTypes,
  anskeyType,
  AnsStoreType,
  ansType,
  Right_Wrong_set_type,
  Task,
} from "./types/types";
import { ExamQuestionProcessor } from "./ExamQuestionProcessor";
import { RedisProvider } from "./radisProvider";
import { debuglog } from "../utils/debugLog";

export class ExamAnsProcessor {
  AnsStore: AnsStoreType;
  AnsKeys: AnsKeysTypes;
  ExamPatternStore: any;
  private static instance: ExamAnsProcessor;
  private questionprocessor: ExamQuestionProcessor;
  private ansclient: RedisProvider;

  private constructor() {
    this.AnsStore = {};
    this.AnsKeys = {};
    this.ExamPatternStore = {};
    this.questionprocessor = ExamQuestionProcessor.getInstance(5);
    this.ansclient = RedisProvider.getInstance();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new ExamAnsProcessor();
    }
    return this.instance;
  }
  getansClient() {
    return this.ansclient;
  }

  async getAnsKeys(examid: string) {
    try {
      let Examsans;
      let isExist = await this.getansClient().getAnsSheet(examid);
      if (!isExist) {
        Examsans = await this.questionprocessor
          .getNetworkInstance()
          .getExamQuestionsAns(examid);
        this.getansClient().setAnsSheet(Examsans, examid, 18000);
      } else {
        Examsans = JSON.parse(isExist as string);
      }
      return Examsans;
    } catch (error) {
      console.log("error in examprocesser -> getExamsAnsSet ", error);
    }
  }

  async getExamPatternFormStore(examid: string) {
    try {
      let Exampattern;

      // exam pattern
      let isExist = await this.getansClient().getExamPattern(examid);
      if (!isExist) {
        let exam_pattern_id = await this.questionprocessor
          .getNetworkInstance()
          .getExamPatternId(examid);
        Exampattern = await this.questionprocessor
          .getNetworkInstance()
          .getExamPattern(exam_pattern_id);
        this.getansClient().setExamPattern(Exampattern, examid, 18000);
      } else {
        Exampattern = JSON.parse(isExist as string);
      }

      return Exampattern;
    } catch (error) {
      console.log(error);
    }
  }

  async getUserAndExamAns(examid: string, userid: string) {
    try {
      let userans: any = await this.getansClient().getUserans(examid, userid);
      /* { number: { ans: ["1"], part: 'part1' } } */
      let examAns = await this.getAnsKeys(examid);

      const result = examAns.map((q: any) => {
        const user = userans[0][q.id];
        return {
          [q.id]: {
            ans: user ? user.ans : "0",
            part: user ? user.part : q.part,
            topic: q.topic,
          },
        };
      });

      // done data are valid for mat
      if (userans) {
        // store user ans data in to score table
        await this.questionprocessor
          .getNetworkInstance()
          .SetUserAns(examid, userid, result);
        return [examAns, userans[0]];
      }
      return [[], []];
    } catch (error) {
      console.error("error in getUserAns", error);
    }
  }

  async setUserScore(
    examid: string,
    userid: string,
    Score: number,
    not_attempt: number,
    Result: Right_Wrong_set_type,
    subject_wise_result: Right_Wrong_set_type,
    all_parts_total_questions: number
  ) {
    try {
      // debuglog(examid);
      // debuglog(userid);
      // debuglog(Score);
      // debuglog(not_attempt);
      // debuglog(Result);
      // debuglog(subject_wise_result);
      // debuglog(all_parts_total_questions);

      // ok , ans inpute are veryfied

      // console.log("in data base save function  score is ", Score);

      let examData = await this.questionprocessor
        .getNetworkInstance()
        .getExamDetails(examid);

      if (!examData) throw new Error("Exam type not found");
      let examType = examData?.examtype;

      switch (examType) {
        case "Mock":
          {
            console.log("user score adding into db . exam is -> Mock");
            let Score = await this.questionprocessor
              .getNetworkInstance()
              .getUserScore(examid, userid);
            let isScore = Score && Score.length > 0 ? true : false;
            if (isScore) {
              // console.log("isSocre",isScore);
              console.log("user score already Stored");
              return 1;
            }
          }
          break;

        case "PYQ":
          {
            console.log("user score adding into db . exam is -> PYQ");
            let Score = await this.questionprocessor
              .getNetworkInstance()
              .getUserScore(examid, userid);

            let isScore = Score && Score.length > 0 ? true : false;

            if (isScore) {
              // console.log("isSocre",isScore);
              console.log("user score already Stored");
              return 1;
            }
          }
          break;
        case "Exam":
          {
            console.log("user score adding into db . exam is -> EXAM");

            let Score = await this.questionprocessor
              .getNetworkInstance()
              .getUserScore(examid, userid);
            let isScore = Score && Score.length > 0 ? true : false;

            if (isScore) {
              // console.log("isSocre",isScore);
              console.log("user score already Stored");
              return 1;
            }
          }
          break;
        case "Dpp":
          {
            console.log("user score adding into db . exam is -> DPP");

            let Score = await this.questionprocessor
              .getNetworkInstance()
              .getUserScore(examid, userid);

            let isScore = Score && Score.length > 0 ? true : false;

            if (isScore) {
              // console.log("isSocre",isScore);
              console.log("user score already Stored");
              return 1;
            }
          }
          break;

        default:
          console.log("invalid or incorrect exam type");

          break;
      }

      let userSocre = {
        user_id: userid,
        exam_id: examid,
        not_attempt: not_attempt,
        score: Score * 100,
        topic_wise_result: subject_wise_result,
        result: Result,
        total_questions: all_parts_total_questions,
        time: new Date(),
      };

      let res = await this.questionprocessor
        .getNetworkInstance()
        .setUserScore(examid, userid, userSocre);

      // if (!res) {
      //   return 0;
      // }
      // add infomation to progress
      let updatedProgress = await this.questionprocessor
        .getNetworkInstance()
        .setUserProgress(userid, {
          lastExamid: examid,
          examType: examType,
        });

      debuglog(updatedProgress)

      return null;
    } catch (error) {
      console.log("error in setUserScore  function--- > ", error);
    }
  }
}
