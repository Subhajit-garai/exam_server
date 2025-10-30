import { userManager } from "./userManger";
import { RedisProvider } from "../radisProvider";
import { ExamQuestionsids, Task } from "../types";
import prisma from  "@repo/db/index";
import { JsonValue } from "@prisma/client/runtime/library";
import { examformat } from  "@repo/packages/prisma"
import { exam_question_format_type } from "../types/questionTypes";

let count = 0;
interface exam_info {
  id: string;
  total_question: {
    [key: string]: number;
  };
  parts: number;
}



export class examManager {
  private static instance: examManager;
  private redisclient: RedisProvider;
  // private redisQuestion: RedisQuestionProvider;
  user: userManager;
  exam2: string[];
  exam: { [examid: string]: exam_info };

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
    this.exam2 = [];
    this.user = userManager.getInstance();
    this.exam = {};
  }

  getredisclient() {
    return this.redisclient;
  }

  async getquestion(
    type: string,
    examid: string,
    userid: string,
    part: string | number,
    num: string,
    isnewMethod: boolean = false
  ) {
    console.log("---->", ++count);

    if (isnewMethod) {
      let isValidUser = this.user.isuserexist(examid, userid);
      let number: number = parseInt(num);
      // console.log("isValidUser", isValidUser);
      // console.log("number", number);
      // console.log("num", num);

      if (isValidUser) {
        let total_questions = this.exam[examid].total_question[part];
        // console.log("total_question", total_questions);

        switch (type) {
          case "pre":
            if (number <= 1) {
              number = total_questions + 1;
            }
            --number;
            break;
          case "next":
            if (number == total_questions) {
              number = 0;
            }
            ++number;
            break;
          default:
            break;
        }
        // get data from redis

        console.log("number", number);

        if (number) {
          console.log(`examquestion:${examid}:${part}:${number}`);
          let question = await this.redisclient.get(
            `examquestion:${examid}:${part}:${number}`
          );

          // console.log("----> question",question);

          return { question, number };
        }
      } else {
        return null;
      }
    } else {
      let exam = this.exam2.find((e) => e === examid);

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
          return { question, number }; // add is multible ans
        }
      } else {
        return null;
      }
    }
  }

  async submitExam(examid: string, userid: string) {
    // delete this.exam[examid];
    this.user.removeuser(examid, userid);
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
    ismultiple: boolean,
    isnewMethod: boolean = false
  ) {
    if (isnewMethod) {
      let isValidUser = this.user.isuserexist(examid, userid);
      if (!isValidUser) throw new Error("user is not given this exam ");
      return await this.getredisclient().push({
        type: "AnsProcessing",
        examid: examid,
        userid: userid,
        part: part,
        ans: ans,
        // id: selectedId,
        ismultiple: ismultiple ?? false,
        number: number,  // may add some feature which need question number
      });
    } else {
      let partdata = this.questionsids[examid][part];
      let selectedId = partdata[parseInt(number)];
      console.log("selectedId", selectedId);

      return await this.getredisclient().push({
        type: "AnsProcessing",
        examid: examid,
        userid: userid,
        part: part,
        ans: ans,
        number: selectedId,
        ismultiple: ismultiple ?? false,
        // number: number,  // may add some feature which need question number
      });
    }
  }

  async addexam(examid: string, data: any, isnewMethod: boolean = false) {
    if (isnewMethod) {
      let QuestionMap: Map<string, exam_question_format_type> = new Map();
      let allquestionids: string[] = [];

      let examQuestions = await prisma.question_map.findMany({
        where: {
          examid: examid,
        },
      });
      if (!examQuestions) throw new Error("exam's question not found");

      // question data which are send / cache in redis

      // add exam info

      this.setExamMetaData(examid);
      examQuestions.map((que) => {
        allquestionids.push(que.questionid);

        let temp: exam_question_format_type = {
          id: "",
          number: 0,
          options: [],
          ans: [],
          title: "",
          extra: {},
          formate: "Text",
          part: "",
          topic_id: "",
          is_multiple_ans: false,
          isSuffled: false,
        };
        if (que.isSuffled) {
          temp.options = que.options;
          temp.ans = que.ans;
        }
        temp.id = que.questionid;
        temp.number = que.number;
        temp.isSuffled = que.isSuffled;
        temp.part = que.part ? que.part : "part1";

        QuestionMap.set(que.questionid + ":" + que.part, temp);
      });

      if (allquestionids.length > 0) {
        let res = await prisma.questions.findMany({
          where: {
            id: {
              in: allquestionids,
            },
          },
          select: {
            id: true,
            title: true,
            options: true,
            is_multiple_ans: true,
            extra: true,
            format: true,
            ans: true,
            topic_id: true,
          },
        });

        let tempMap: Map<
          string,
          {
            id: string;
            options: string[];
            ans: string[];
            title: string;
            extra: JsonValue;
            format: examformat;
            topic_id: string;
            is_multiple_ans: boolean;
          }
        > = new Map();

        if (!res) throw new Error("question data found , id may be invalid");

        res.map((Question) => {
          tempMap.set(Question.id, Question);
        });

        QuestionMap.forEach((value, key) => {
          let Question = tempMap.get(key.split(":")[0]);
          if (!Question) throw new Error("key invalid");

          if (!value?.isSuffled) {
            value.options = Question.options;
            value.ans = Question.ans;
          }
          value.title = Question.title;
          value.extra = Question.extra;
          value.formate = Question.format;
          value.topic_id = Question.topic_id;
          value.is_multiple_ans = Question.is_multiple_ans;

          QuestionMap.set(value.id + ":" + value.part, value);

          this.redisclient.set(`examquestion:${key}:${value.number}`, value);
        });

        if (QuestionMap) {
          QuestionMap.forEach((question) => {
            this.redisclient.set(
              `examquestion:${examid}:${question?.part}:${question.number}`,
              question
            );
          });
          console.log("questions added to redis");
        } else {
          return null;
        }
      }
    } else {
      this.exam2.push(examid); // here add some extra data
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

      // question data which are send / cache in redis

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
            is_multiple_ans: true,
            extra: true,
            format: true,
            topic_id: true,
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
    }
  } //end

  async setExamMetaData(examid: string) {
    let examData = await prisma.exam.findFirst({
      where: {
        id: examid,
      },
      select: {
        exam_pattern_id: true,
      },
    });

    if (!examData) throw new Error("exam is not valid ");
    let examPatternInfo = await prisma.exam_pattern.findFirst({
      where: {
        id: examData.exam_pattern_id,
      },
    });
    if (!examPatternInfo) throw new Error("exam pattern  is not valid ");

    let temp: exam_info = {
      id: "",
      total_question: {},
      parts: 0,
    };
    let { total_questions, part_Count } = examPatternInfo;
    total_questions.map((number, idx) => {
      temp.total_question[`part${idx + 1}`] = number;
    });
    temp.id = examid;
    temp.parts = part_Count;
    this.exam[examid] = temp;
  }

  removeexam(examid: string, isnewMethod: boolean = false) {
    if (isnewMethod) {
    } else {
      if (this.exam2.includes(examid)) {
        this.exam2 = this.exam2.filter((id) => id !== examid);
        delete this.questionsids[examid];
        console.log("id removed ,", examid);
      } else {
        console.log("id not found,", examid);
      }
    }
  }

  ClearCache_exmaManager() {
    this.exam2 = [];
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
