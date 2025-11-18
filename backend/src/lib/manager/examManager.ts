import { userManager } from "./userManger";
import { RedisProvider } from "../radisProvider";
import { ExamQuestionsids } from "../types";
import prisma from "@repo/db/index";
import {
  exam_question_format_for_ui_type,
  exam_question_format_type,
} from "../types/questionTypes";
import { shuffleArraySeeded } from "../helper/shuffle";
import { JsonValue } from "@prisma/client/runtime/library";

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
    num: string
  ) {
    let isValidUser = this.user.isuserexist(examid, userid);
    let number: number = parseInt(num);

    if (isValidUser) {
      let total_questions = this.exam[examid].total_question[part];
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
      if (number) {
        let question: exam_question_format_type = await this.redisclient.get(
          `examquestion:${examid}:${part}:${number}`
        );

        if (!question || !question.question)
          throw Error("question data not found");

        let data: exam_question_format_for_ui_type = {
          number: question.number,
          part: question.part,
          question: {
            questionid: question.question?.id,
            title: question.question?.title,
            options: question.question?.options,
            extra: question.question?.extra,
            format: question.question?.format,
            is_multiple_ans: question.question?.is_multiple_ans,
          },
        };
        return data;
      }
    } else {
      return null;
    }
  }

  async submitExam(examid: string, userid: string) {
    // delete this.exam[examid];
    this.user.removeuser(examid, userid);
    return await this.getredisclient().push({
      type: "CREATE_SCORE",
      id: examid,
      payload: {
        examid: examid,
        userid: userid,
      },
    });
  }

  async submitAnswer(
    examid: string,
    userid: string,
    part: string,
    ans: string[],
    number: string,
    ismultiple: boolean
  ) {
    let isValidUser = this.user.isuserexist(examid, userid);
    if (!isValidUser) throw new Error("user is not given this exam ");
    return await this.getredisclient().push({
      id: examid,
      type: "ANS_PROCESSING",
      payload: {
        examid: examid,
        userid: userid,
        part: part,
        ans: ans,
        ismultiple: ismultiple ?? false,
        number: number,
      },
    });
  }

  async addexam(examid: string) {
    let examQuestions = await prisma.question_map.findMany({
      where: {
        examid: examid,
      },
      select: {
        number: true,
        part: true,
        question: {
          select: {
            id: true,
            options: true,
            title: true,
            extra: true,
            format: true,
            is_multiple_ans: true,
          },
        },
      },
    });

    if (!examQuestions) throw new Error("exam's question not found");

    // shuffling process here

    // every exam have shuffled question

    // if exam have shulled question , then shuffleed with exam id
    // if exam have all user question shulled , like 2 user doesnot have same order then shuffled with examid+useris or user id

    let formatedQuestions: exam_question_format_type[] = examQuestions.map(
      (question, idx) => {
        if (!question.question?.options)
          throw Error("question doesnot have options");

        let { shuffled, map } = shuffleArraySeeded(
          question.question?.options,
          examid
        );
        question.question.options = shuffled;

        return {
          ...question,
          question: {
            ...question.question,
            options: shuffled,
            map: map,
          },
        };
      }
    );

    // question data which are send / cache in redis

    this.setExamMetaData(examid);

    formatedQuestions.forEach((question) => {
      this.redisclient.set(
        `examquestion:${examid}:${question?.part}:${question.number}`,
        question
      );
    });
    console.log("questions added to redis");
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
