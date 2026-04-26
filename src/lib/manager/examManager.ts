import { QueueManager } from "../queue/queueManager.js";
import { RedisManager } from "../redis/redisManager.js";
import { ExamCategory, TaskType } from "../types/types.js";
import { db } from "@repo/db/index.js";
import {
  exam_question_format_type,
} from "../types/questionTypes.js";
import { shuffleArraySeeded } from "@/utils/shuffle.js";
import { logger } from "@/utils/logger.js";
import { exams, exam_patterns, exam_years, target_exams } from "@repo/db/schema/exam.js";
import { syllabuses } from "@repo/db/schema/syllabus.js";
import { question_maps, questions } from "@repo/db/schema/question.js";
import { eq, and } from "drizzle-orm";
import { exam_question_format_for_ui_type } from "@/ws/types/ws.types.js";

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
  private queueManager: QueueManager;
  private redis: any; // Direct ioredis client

  public static getInstance() {
    if (!this.instance) {
      this.instance = new ExamManager();
    }
    return this.instance;
  }

  private constructor() {
    this.queueManager = QueueManager.getInstance();
    this.redis = RedisManager.getInstance().getclient();
  }

  getQueueManager() {
    return this.queueManager;
  }

  // --- User Management (Redis Sets) ---

  async addUser(examId: string, userId: string) {
    await this.redis.sadd(`exam:users:${examId}`, userId);
    logger.debug(`User ${userId} added to exam ${examId}`);
  }

  async removeUser(examId: string, userId: string) {
    await this.redis.srem(`exam:users:${examId}`, userId);
    logger.debug(`User ${userId} removed from exam ${examId}`);
  }

  async isUserExist(examId: string, userId: string): Promise<boolean> {
    const exists = await this.redis.sismember(`exam:users:${examId}`, userId);
    return exists === 1;
  }

  // --- Exam Metadata (Redis Hashes) ---

  async setExamMetaData(examId: string) {
    const examData = await db.select({ exam_pattern_id: exams.exam_pattern_id })
      .from(exams)
      .where(eq(exams.id, examId))
      .then(res => res[0]);

    if (!examData) throw new Error("Exam not valid");

    const examPatternInfo = await db.select()
      .from(exam_patterns)
      .where(eq(exam_patterns.id, examData.exam_pattern_id))
      .then(res => res[0]);

    if (!examPatternInfo) throw new Error("Exam pattern not valid");

    const { total_questions, part_count } = examPatternInfo;

    const metaData: ExamMetaData = {
      id: examId,
      total_question: {},
      parts: part_count,
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
    logger.info(`Exam ${examId} removed`);
  }

  // --- Question Management ---


  async refresh(id: string, userid: string, Tasktype: TaskType = "CREATE_EXAM") {

    const Examinfo = await db.select({
      id: exams.id,
      examtype: exams.exam_type,
      syllabusid: exam_patterns.syllabus_id
    })
      .from(exams)
      .leftJoin(exam_patterns, eq(exams.exam_pattern_id, exam_patterns.id))
      .where(eq(exams.id, id))
      .then(res => res[0]);

    if (!Examinfo) throw Error("exam info not found")

    if (Examinfo.examtype == "Mock" || Examinfo.examtype == "PYQ") {
      logger.info(`exam type is ${Examinfo.examtype} , so no need to refresh / add question by random`)
      return true;
    }

    const syllabus_id = Examinfo?.syllabusid;

    if (!syllabus_id) throw new Error("Syllabus ID not found");

    const categoryexamdata = await db.select({
      name: target_exams.name
    })
      .from(syllabuses)
      .innerJoin(exam_years, eq(syllabuses.exam_year_id, exam_years.id))
      .innerJoin(target_exams, eq(exam_years.target_exam_id, target_exams.id))
      .where(eq(syllabuses.id, syllabus_id))
      .then(res => res[0]);

    if (!categoryexamdata) throw new Error("Category Exam not found");

    const categoryexam = categoryexamdata.name.toUpperCase() as ExamCategory


    const Notifystatus = await this.getQueueManager().push({
      type: Tasktype,
      id: Examinfo?.id,
      payload: {
        examid: Examinfo?.id,
        userid: userid,
        examtype: Examinfo?.examtype as any,
      },
      variant: Examinfo?.examtype as any,
      category: categoryexam,
    });

    return Notifystatus;

  }




  async addExam(examId: string) {

    const examQuestionsRaw = await db.select({
      number: question_maps.number,
      part: question_maps.part,
      questionId: questions.id,
      options: questions.options,
      title: questions.title,
      extra: questions.extra,
      format: questions.format,
      is_multiple_ans: questions.is_multiple_answers,
    })
      .from(question_maps)
      .innerJoin(questions, eq(question_maps.question_id, questions.id))
      .where(eq(question_maps.exam_id, examId));

    if (!examQuestionsRaw || examQuestionsRaw.length === 0) throw new Error("Exam questions not found");

    const formattedQuestions: exam_question_format_type[] = examQuestionsRaw.map((q) => {
      if (!q.options) throw Error("Question does not have options");

      const { shuffled, map } = shuffleArraySeeded(q.options, examId);

      return {
        number: q.number,
        part: q.part,
        question: {
          id: q.questionId,
          options: shuffled,
          map: map,
          title: q.title,
          extra: q.extra as any,
          format: q.format,
          is_multiple_ans: q.is_multiple_ans,
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
    logger.success("Questions added to Redis");
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
    return await this.queueManager.push({
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

    return await this.queueManager.push({
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
