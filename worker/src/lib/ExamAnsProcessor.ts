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
  private examprocessor: ExamQuestionProcessor;
  private ansclient: RedisProvider;

  private constructor() {
    this.AnsStore = {};
    this.AnsKeys = {};
    this.ExamPatternStore = {};
    this.examprocessor = ExamQuestionProcessor.getInstance(5);
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
    if (!this.AnsStore.examid) {
      Examsans = await this.examprocessor.getExamsAnsSet(examid);
      this.AnsStore.examid = Examsans;
      console.log("ans setted to ans Store");
    } else {
      Examsans = this.AnsStore.examid;
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

    if (!this.ExamPatternStore.examid) {
      let exam_pattern_id = await this.examprocessor.getExamPatternId(examid);
      Exampattern = await this.examprocessor.getExamPattern(exam_pattern_id);

      this.ExamPatternStore.examid = Exampattern;
    } else {
      Exampattern = this.ExamPatternStore.examid;
    }

    return Exampattern;
    } catch (error) {
      console.log(error);
    }
  }

  async getUserAns(examid: string, userid: string) {

    try {
    let Examsans;
    let keys;
    
    if (!this.AnsStore.examid) {
      Examsans = await this.examprocessor.getExamsAnsSet(examid);
      this.AnsStore.examid = Examsans;
      console.log("ans setted to ans Store");
    } else {
      Examsans = this.AnsStore.examid;
    }

    if (!this.AnsKeys.examid) {
      keys = Examsans.map((ans: ansType) => {
        return { id: ans.id, part: ans.part };
      });
      this.AnsKeys.examid = keys;
      console.log("anskeys setted to ans Store");
    } else {
      keys = this.AnsKeys.examid;
    }    
    

    let userkeys = keys.map((key: anskeyType) => {
      let { part, id } = key;
      return `${this.getansClient().StoerPrefix}:${examid}:${userid}:${part}:${id}`;
    });
    let userans: any = await this.getansClient().get(userkeys);

    let formated_user_Ans = keys.map((key: anskeyType, i: number) => {
      let ans: string | null = userans[i];
      return { [key.id]: { ans: ans, part: key.part } }; // if multiple ans present --> { [key.id]: { ans: [ans], part: key.part } }
    });

    // store user ans data in to score table

    
    this.examprocessor.setUseransTodb(formated_user_Ans, examid, userid);

    return formated_user_Ans;
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

  ) {
    
    try {
      
      let isScore = await this.examprocessor.prisma.score.findFirst({
        where: {
          AND:[
            {exam_id: examid},
            {user_id: userid},
          ]
        },
      });
  
      if (isScore) {
        // console.log("isSocre",isScore);
        console.log("user score already Stored");
        return 1;
      }
  
      let res = await this.examprocessor.prisma.score.create({
        data: {
          user_id: userid,
          exam_id: examid,
          not_attempt: not_attempt,
          score: Score,
          topic_wise_result: subject_wise_result,
          result: Result,
        },
      });
  
      if(!res){
        return 0
      }
  
      return res    
    } catch (error) {
      console.log("error in setUserScore --- > " ,error);
      
    }
  }
}
