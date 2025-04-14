import { userManager } from "./userManger";
import { RedisProvider } from "./radisProvider";
import { ExamQuestionsids, Task } from "./types";
import prisma from "../db";

export class examManager {
  private static instance: examManager;
  private redisclient: RedisProvider;
  // private redisQuestion: RedisQuestionProvider;
  user: userManager;
  exam: string[];
  questionsids: ExamQuestionsids;

  public static getInstance() {
    if (!this.instance) {
      this.instance = new examManager();
    }
    return this.instance;
  }

  private constructor() {
    this.redisclient = RedisProvider.getInstance();
    this.questionsids = {};
    this.exam = [];
    this.user = userManager.getInstance();
  }

  getredisclient() {
    return this.redisclient;
  }

  async getquestion(
    type: string,
    examid: string,
    userid: string,
    part: string | number,
    num: string
  ) {
    let exam = this.exam.find((e) => e === examid);
    let user = this.user.isuserexist(examid, userid);
    let number: number = parseInt(num);
    let questionid;

    // console.log("exam ids ", this.exam);
    // console.log("exam ids ", this.questionsids);

    if (exam && user) {
      let partdata = this.questionsids[examid][part];
      let total_questions = Object.keys(partdata).length;

      switch (type) {
        case "pre":
          if (number <= 1) {
            number = total_questions + 1;
          }
          questionid = partdata[--number];
          break;
        case "next":
          if (number == total_questions) {
            number = 0;
          }
          questionid = partdata[++number];
          break;
        default:
          questionid = partdata[number];
          break;
      }
      // get data from redis
      if (questionid) {
        let question = await this.redisclient.get(`question:${questionid}`);
        return { question, number};  // add is multible ans 
      }
    } else {
      return null;
    }
  }

  async submitExam(examid: string, userid: string) {
    return await this.getredisclient().push({
      type: "CreateScore",
      examid: examid,
      userid: userid,
    });
  }

  async submitAnswer(
    examid: string,
    userid: string,
    part: string,
    ans: string[],
    number: string,
    ismultiple:boolean
  ) {
    
    let partdata = this.questionsids[examid][part];
    let selectedId = partdata[parseInt(number)];
    console.log("selectedId", selectedId);

    return await this.getredisclient().push({
      type: "AnsProcessing",
      examid: examid,
      userid: userid,
      part: part,
      ans: ans,
      id: selectedId,
      ismultiple:  ismultiple ?? false
      // number: number,  // may add some feature which need question number
    });
  }

  async addexam(examid: string, data: any) {
    this.exam.push(examid);
    let allids: [] = [];
    let partinfo: any = {};

    // here check is question and other info is already added , and if added then expiry time is > 2h

    Object.keys(data).map((d: any) => {
      Object.keys(data[d]).map((p: any) => {
        let ids = Object.values(data[d][p]).flat() as [];

        if (!partinfo[p]) {
          partinfo[p] = {};
        }
        ids.map((id: any, i) => {
          partinfo[p][i + 1] = id;
        });
        allids = [...allids, ...ids];
      });
    });

    // this added into BE ceche --> change it to redis
    this.questionsids[examid] = partinfo;

    if (allids.length > 0) {
      let res = await prisma.questions.findMany({
        where: {
          id: {
            in: allids,
          },
        },
        select: {
          id: true,
          title: true,
          options: true,
          is_multiple_ans:true
        },
      });

      if (res) {
        res.forEach((question: any) => {
          this.redisclient.set(`question:${question.id}`, question);
        });
        console.log("questions added to redis");
      } else {
        return null;
      }
    }
  } //end

  removeexam(examid: string) {
    if (this.exam.includes(examid)) {
      this.exam = this.exam.filter((id) => id !== examid);
      delete this.questionsids[examid];
      console.log("id removed ,", examid);
    } else {
      console.log("id not found,", examid);
    }
  }

  ClearCache_exmaManager() {
    this.exam = [];
    this.questionsids = {};
  }


  async getQuizdata(key: string) {
    let data = await this.redisclient.get(key);
    if (data) {
      return data;
    } else {
      return null;
    }
  }
}
