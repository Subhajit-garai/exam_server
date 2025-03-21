import { CreationTypes, PrismaClient } from "@prisma/client";
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
        Examsans = await this.questionprocessor.getExamsAnsSet(examid);
        this.getansClient().setAnsSheet( Examsans ,examid ,18000);
      } else {
        Examsans = JSON.parse( isExist as string );
      }
      // demo structure 
     /* {
       id: string,
        ans: [string],
        status: string,
        examid: string,
      } */
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
        let exam_pattern_id = await this.questionprocessor.getExamPatternId(
          examid
        );
        Exampattern = await this.questionprocessor.getExamPattern(
          exam_pattern_id
        );
        this.getansClient().setExamPattern( Exampattern,examid,18000);
      } else {
        Exampattern = JSON.parse( isExist as string );
      }

      

      return Exampattern;
    } catch (error) {
      console.log(error);
    }
  }

  async getUserAns(examid: string, userid: string) {
    try {
      let userans: any = await this.getansClient().getUserans(examid, userid);
      /* { cm5nywh32003gbu5gbivsjwfk: { ans: ["1"], part: 'part1' } } */
      if(userans) {
         // store user ans data in to score table
        this.questionprocessor.setUseransTodb(userans[1], examid, userid);
        return userans[0];
      }
      return null
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
      let isScore = await this.questionprocessor.prisma.score.findFirst({
        where: {
          AND: [{ exam_id: examid }, { user_id: userid }],
        },
      });

      if (isScore) {
        // console.log("isSocre",isScore);
        console.log("user score already Stored");
        return 1;
      }

      let res = await this.questionprocessor.prisma.score.create({
        data: {
          user_id: userid,
          exam_id: examid,
          not_attempt: not_attempt,
          score: Score,
          topic_wise_result: subject_wise_result,
          result: Result,
          total_questions: all_parts_total_questions,
        },
      });

      if (!res) {
        return 0;
      }

      return res;
    } catch (error) {
      console.log("error in setUserScore --- > ", error);
    }
  }
}
