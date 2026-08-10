import {
  AnsKeysTypes,
  anskeyType,
  AnsStoreType,
  ansType,
  Right_Wrong_set_type,
  Task,
} from "./types/types.js";
import { RedisManager } from "@/lib/redis/redisManager.js";
import { exam_question_format_type } from "./types/ans-prossing-types.js";
import { BotService } from "@/services/bot/bot.service.js";

export class examAnsManager {
  AnsStore: AnsStoreType;
  AnsKeys: AnsKeysTypes;
  ExamPatternStore: any;
  private static instance: examAnsManager;
  private ansclient: RedisManager;
  private botService: BotService;

  private constructor() {
    this.AnsStore = {};
    this.AnsKeys = {};
    this.ExamPatternStore = {};
    this.ansclient = RedisManager.getInstance();
    this.botService = new BotService();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new examAnsManager();
    }
    return this.instance;
  }
  getansClient() {
    return this.ansclient;
  }

  async getAnsKeys(examid: string) {
    try {
      let Examsans;
      let isExist = await this.getAnsSheet(examid);
      if (!isExist) {
        Examsans = await this.botService.exam.getExamAnswers(examid);
        this.setAnsSheet(Examsans, examid, 18000);
      } else {
        Examsans = JSON.parse(isExist as string);
      }
      return Examsans;
    } catch (error) {
      console.log("error in examprocesser -> getExamsAnsSet ", error);
    }
  }

  async getAnsSheet(examid: string) {
    const StoerPrefix: string = "AnsSheet";
    let key = `${StoerPrefix}:${examid}`;
    let data = await this.ansclient.getclient().get(key);

    return data ? data : null;
  }

  async setAnsSheet(
    data: {
      id: string;
      examid: string;
      ans: any;
      status: string;
    }[],
    examid: string,
    EX: number = 0,
  ) {
    const StoerPrefix: string = "AnsSheet";
    let ansSheetData: string;
    ansSheetData = JSON.stringify(data);

    return this.ansclient
      .getclient()
      .set(`${StoerPrefix}:${examid}`, ansSheetData, "EX", EX, "NX");
  }

  async getExamPatternFormStore(examid: string) {
    try {
      let Exampattern;

      // exam pattern
      let isExist = await this.getExamPattern(examid);
      if (!isExist) {
        let exam_pattern_id =
          await this.botService.exam.getExamPatternId(examid);
        Exampattern =
          await this.botService.exam.getExamPattern(exam_pattern_id);
        this.setExamPattern(Exampattern, examid, 18000);
      } else {
        Exampattern = JSON.parse(isExist as string);
      }

      return Exampattern;
    } catch (error) {
      console.log(error);
    }
  }

  async setExamPattern(data: any, examid: string, EX: number = 0) {
    const StoerPrefix: string = "ExamPattern";
    let ansSheetData: string;
    ansSheetData = JSON.stringify(data);

    return this.ansclient
      .getclient()
      .set(`${StoerPrefix}:${examid}`, ansSheetData, "EX", EX, "NX");
  }

  async getExamPattern(examid: string) {
    const StoerPrefix: string = "ExamPattern";
    let key = `${StoerPrefix}:${examid}`;
    let data = await this.ansclient.getclient().get(key);

    return data ? data : null;
  }

  async getUserAndExamAns(examid: string, userid: string) {
    try {
      let userans: any = await this.getUserans(examid, userid);
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
        return [examAns, userans[0]];
      }
      return [[], []];
    } catch (error) {
      console.error("error in getUserAns", error);
    }
  }

  setUserans(data: any, EX: number = 0) {
    const StoerPrefix: string = "ans";
    let ansData: string;

    let { examid, userid, part, ans, ismultiple, number } = data;

    if (typeof ans != "string") {
      // ansData = JSON.stringify(ansdata);
      if (ismultiple) {
        ansData = ans.join(","); // multiple ans ["1","2","3"]  --> "1,2,3"
      } else {
        ansData = ans[0]; // single ans
      }
    } else {
      ansData = ans;
    }
    // console.log("ans str" ,`${this.StoerPrefix}:${examid}:${userid}:${part}:${id}`,"data",data);

    return this.ansclient
      .getclient()
      .set(
        `${StoerPrefix}:${examid}:${userid}:${part}:${number}`,
        ansData,
        "EX",
        EX,
      );
  }

  async getQuestionInfoFromCatch(key: string) {
    const question = await this.ansclient.getclient().get(key);
    return question ? JSON.parse(question) : null;
  }

  async getQuestionsInfoFromCatch(
    examid: string,
    userid: string,
    part: string,
  ) {
    let key = `${"examquestion"}:${examid}:${part}:*`;

    let keys = await this.ansclient.scanKeys(key);
    const question_arr = await this.ansclient.getclient().mget(keys);

    if (!question_arr) return;

    type question_Formated_type = Record<string, exam_question_format_type>;

    let question_Formated: question_Formated_type = {};

    question_arr.map((question) => {
      if (!question) throw Error("question not forund");
      let question_json: exam_question_format_type = JSON.parse(question);

      question_Formated[question_json.number] = question_json;
    });
    return question_Formated;
  }

  async getUserans(examid: string, userid: string) {
    let key = `${"ans"}:${examid}:${userid}:*`;
    let keys = await this.ansclient.scanKeys(key);

    if (keys.length > 0) {
      const values = await this.ansclient.getclient().mget(keys);
      /* [ { number: { ans: null, part: 'part1' } ]*/
      const ans_array = keys.map((key: string, index: number) => {
        let keyArr = key.split(":");
        let questionNumber = keyArr[4];
        let part = keyArr[3];
        let ans = values[index];
        return {
          [questionNumber]: { ans: ans, part: part },
        };
      });
      /*  { cm5nywh32003gbu5gbivsjwfk: { ans: null, part: 'part1' } , {} }*/

      const ans = keys.reduce<Record<string, { ans: string; part: string }>>(
        (
          acc: Record<string, { ans: string; part: string }>,
          key: string,
          index: number,
        ) => {
          const keyArr = key.split(":");
          const questionNumber = keyArr[4];
          const part = keyArr[3];
          let answer = values[index];

          if (answer === null) {
            answer = "null";
          }

          if (questionNumber) {
            acc[questionNumber] = { ans: answer, part: part };
          }

          return acc;
        },
        {},
      );
      // console.log("ans", ans);

      return [ans, ans_array];
    }
  }

  async setUserScore(
    examid: string,
    userid: string,
    Score: number,
    not_attempt: number,
    Result: Right_Wrong_set_type,
    subject_wise_result: Right_Wrong_set_type,
    all_parts_total_questions: number,
  ) {
    try {
      // console.log("in data base save function  score is ", Score);

      let examData = await this.botService.exam.getExamDetails(examid);

      if (!examData) throw new Error("Exam type not found");
      let examType = examData?.examtype;

      switch (examType) {
        case "Mock":
          {
            console.log("user score adding into db . exam is -> Mock");
            let Score = await this.botService.score.getUserScore(
              examid,
              userid,
            );
            if (Score) {
              console.log("user score already Stored");
              return 1;
            }
          }
          break;

        case "PYQ":
          {
            console.log("user score adding into db . exam is -> PYQ");
            let Score = await this.botService.score.getUserScore(
              examid,
              userid,
            );

            if (Score) {
              console.log("user score already Stored");
              return 1;
            }
          }
          break;
        case "Test":
          {
            console.log("user score adding into db . exam is -> TEST");
            let Score = await this.botService.score.getUserScore(
              examid,
              userid,
            );

            if (Score) {
              console.log("user score already Stored");
              return 1;
            }
          }
          break;
        case "Dpp":
          {
            console.log("user score adding into db . exam is -> DPP");
            let Score = await this.botService.score.getUserScore(
              examid,
              userid,
            );
            if (Score) {
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

      let res = await this.botService.score.setUserScore(
        examid,
        userid,
        userSocre,
      );

      // if (!res) {
      //   return 0;
      // }
      // add infomation to progress

      // let updatedProgress = await this.botService.score.updateUserProgress(userid, {
      //   lastExamid: examid,
      //   examType: examType,
      // });

      return null;
    } catch (error) {
      console.log("error in setUserScore  function--- > ", error);
    }
  }

  async setUserAnsIntoDb(userans: any) {
    // store user ans data in to score table
    let isSended = await this.botService.score.setUserAnswer(userans);

    if (!isSended) {
      // push into task queue
      console.log("user ans pushed into task queue again");
      return null;
    }
    return isSended;
  }
}
