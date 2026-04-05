import { RedisProvider } from "../radisProvider.js";
import { ExamCategory, TaskType } from "../types.js";
import prisma from "@repo/db/index.js";
import {
  exam_question_format_for_ui_type,
  exam_question_format_type,
} from "../types/questionTypes.js";
import { shuffleArraySeeded } from "../helper/shuffle.js";

interface ExamMetaData {
  id: string;
  total_question: {
    [key: string]: number;
  };
  parts: number;
}

interface User {
  id: string;
}

export class ExamManager {
  private static instance: ExamManager;
  private redisProvider: RedisProvider;
  private redis: any; // Direct ioredis client

  public static getInstance() {
    if (!this.instance) {
      this.instance = new ExamManager();
    }
    return this.instance;
  }

  private constructor() {
    this.redisProvider = RedisProvider.getInstance();
    this.redis = this.redisProvider.getclient();
  }

  getRedisClient() {
    return this.redisProvider;
  }

  // --- User Management (Redis Sets) ---

  async addUser(examId: string, userId: string) {
    await this.redis.sadd(`exam:users:${examId}`, userId);
    console.log(`User ${userId} added to exam ${examId}`);
  }

  async removeUser(examId: string, userId: string) {
    await this.redis.srem(`exam:users:${examId}`, userId);
    console.log(`User ${userId} removed from exam ${examId}`);
  }

  async isUserExist(examId: string, userId: string): Promise<boolean> {
    const exists = await this.redis.sismember(`exam:users:${examId}`, userId);
    return exists === 1;
  }

  // --- Exam Metadata (Redis Hashes) ---

  async setExamMetaData(examId: string) {
    const examData = await prisma.exam.findFirst({
      where: { id: examId },
      select: { exam_pattern_id: true },
    });

    if (!examData) throw new Error("Exam not valid");

    const examPatternInfo = await prisma.exam_pattern.findFirst({
      where: { id: examData.exam_pattern_id },
    });

    if (!examPatternInfo) throw new Error("Exam pattern not valid");

    const { total_questions, part_Count } = examPatternInfo;

    const metaData: ExamMetaData = {
      id: examId,
      total_question: {},
      parts: part_Count,
    };

    total_questions.forEach((num, idx) => {
      metaData.total_question[`part${idx + 1}`] = num;
    });

    // Store as JSON string in Redis for simplicity, or hash fields
    await this.redis.set(`exam:meta:${examId}`, JSON.stringify(metaData));
  }

  async getExamMetaData(examId: string): Promise<ExamMetaData | null> {
    const data = await this.redis.get(`exam:meta:${examId}`);
    return data ? JSON.parse(data) : null;
  }

  async removeExam(examId: string) {
    await this.redis.del(`exam:meta:${examId}`);
    await this.redis.del(`exam:users:${examId}`);
    // Also clean up questions if needed, but that might be expensive to find all keys
    // Assuming questions expire or are managed elsewhere
    console.log(`Exam ${examId} removed`);
  }

  // --- Question Management ---


  async refresh(id: string, userid: string, Tasktype: TaskType = "CREATE_EXAM") {


    let Examinfo = await prisma.exam.findFirst({
      where: {
        id: id,
      },
      select: {
        exam_pattern: {
          select: {
            syllabusid: true
          },

        },
        examtype: true,
        id: true
      },
    });

    if (!Examinfo) throw Error("exam info not found")
    let syllabus_id = Examinfo?.exam_pattern?.syllabusid;

    if (!syllabus_id) throw new Error("Syllabus ID not found");
    let categoryexamdata = await prisma?.syllabus.findFirst({
      where: {
        id: syllabus_id,
      },
      select: {
        exam_year: {
          select: {
            targetExam: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    if (!categoryexamdata) throw new Error("Category Exam not found");

    let categoryexam = categoryexamdata.exam_year?.targetExam.name.toUpperCase() as ExamCategory


    let Notifystatus = await this.getRedisClient().push({
      type: Tasktype,
      id: Examinfo?.id,
      payload: {
        examid: Examinfo?.id,
        userid: userid,
        examtype: Examinfo?.examtype,
      },
      variant: Examinfo?.examtype,
      category: categoryexam,
    });

    return Notifystatus;

  }




  async addExam(examId: string) {
    const examQuestions = await prisma.question_map.findMany({
      where: { examid: examId },
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

    if (!examQuestions || examQuestions.length === 0) throw new Error("Exam questions not found");

    const formattedQuestions: exam_question_format_type[] = examQuestions.map((question) => {
      if (!question.question?.options) throw Error("Question does not have options");

      const { shuffled, map } = shuffleArraySeeded(question.question.options, examId);

      return {
        ...question,
        question: {
          ...question.question,
          options: shuffled,
          map: map,
        },
      };
    });

    await this.setExamMetaData(examId);

    // Pipeline for performance
    const pipeline = this.redis.pipeline();
    formattedQuestions.forEach((question) => {
      pipeline.set(
        `examquestion:${examId}:${question.part}:${question.number}`,
        JSON.stringify(question),
        "EX", 86400 // Expire in 24h
      );
    });
    await pipeline.exec();
    console.log("Questions added to Redis");
  }

  async getQuestion(
    type: "pre" | "next" | "current", // Enforce type
    examId: string,
    userId: string,
    part: string | number,
    currentNumber: number
  ) {
    const isValidUser = await this.isUserExist(examId, userId);
    if (!isValidUser) return null;

    const meta = await this.getExamMetaData(examId);
    if (!meta) throw new Error("Exam metadata not found");

    let number = currentNumber;
    const totalQuestions = meta.total_question[part.toString()];

    switch (type) {
      case "pre":
        if (number <= 1) number = totalQuestions + 1;
        --number;
        break;
      case "next":
        if (number >= totalQuestions) number = 0;
        ++number;
        break;
      default:
        break;
    }

    if (number > 0) {
      const questionStr = await this.redis.get(`examquestion:${examId}:${part}:${number}`);
      if (!questionStr) throw Error("Question data not found");

      const question: exam_question_format_type = JSON.parse(questionStr);

      if (!question.question) throw Error("Question content missing");

      const data: exam_question_format_for_ui_type = {
        number: question.number,
        part: question.part,
        question: {
          questionid: question.question.id,
          title: question.question.title,
          options: question.question.options,
          extra: question.question.extra,
          format: question.question.format,
          is_multiple_ans: question.question.is_multiple_ans,
        },
      };
      return data;
    }
    return null;
  }

  // --- Submission ---

  async submitExam(examId: string, userId: string) {
    await this.removeUser(examId, userId);
    return await this.redisProvider.push({
      type: "CREATE_SCORE",
      id: examId,
      payload: {
        examid: examId,
        userid: userId,
      },
    });
  }

  async submitAnswer(
    examId: string,
    userId: string,
    part: string,
    ans: string[],
    number: string,
    isMultiple: boolean
  ) {
    const isValidUser = await this.isUserExist(examId, userId);
    if (!isValidUser) throw new Error("User is not in this exam");

    return await this.redisProvider.push({
      id: examId,
      type: "ANS_PROCESSING",
      payload: {
        examid: examId,
        userid: userId,
        part: part,
        ans: ans,
        ismultiple: isMultiple ?? false,
        number: number,
      },
    });
  }

  async getQuizData(key: string) {
    const data = await this.redis.get(key);
    return data ? data : null;
  }
}
