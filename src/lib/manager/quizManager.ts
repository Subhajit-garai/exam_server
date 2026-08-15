import { QueueManager } from "@/lib/queue/queueManager.js";
import { RedisManager } from "@/lib/redis/redisManager.js";
import { CustomError } from "@/middleware/globalErrorHandler.js";
import { v4 as uuid } from "uuid";
import { activity_quiz_create_data_type } from "@/zod/quiz.zod.js";
import { CreationTypes } from "@/db/enums.js";
import type { Redis } from "ioredis";
import { LeaderboardManager } from "./leaderboardManager.js";
import { logger } from "@/utils/logger.js";

export interface QuizMetaData {
  id: string;
  total_questions: number;
  nextQuestionTime: number;
  ttl: number;
  topic: string | "All";
  subject: string;
  limit: number;
  status: CreationTypes;
  created_by?: string;
  creator_role?: string;
  created_at: Date;
  countDown?: number;
}

export type leaderboard_type = {
  name: string;
  avatar: string | null;
  score: string;
};

export class QuizManager {
  private static instance: QuizManager;
  private queueManager: QueueManager;
  private redis: Redis;
  private LeaderboardManager: LeaderboardManager;
  private activeQuizTimers: Map<string, NodeJS.Timeout> = new Map();

  public static getInstance() {
    if (!this.instance) {
      this.instance = new QuizManager();
    }
    return this.instance;
  }

  private constructor() {
    this.queueManager = QueueManager.getInstance();
    this.redis = RedisManager.getInstance().getclient();
    this.LeaderboardManager = LeaderboardManager.getInstance();
  }

  // --- API Methods (from backend) ---

  async CreateQuiz(
    userid: string,
    userRole: string,
    data: activity_quiz_create_data_type,
  ) {
    let { mode } = data;
    let limit = 1;
    let quizId = uuid();

    switch (mode) {
      case "1v1":
        limit = 2;
        break;
      case "1v2":
        limit = 3;
        break;
      case "1v3":
        limit = 4;
        break;
      case "1v4":
        limit = 5;
        break;
      case "1v5":
        limit = 6;
        break;
      default:
        throw new CustomError("Free mode not implemented yet", 501);
    }

    let quizdata: QuizMetaData = {
      id: quizId,
      ...data,
      limit: limit,
      created_by: userid,
      creator_role: userRole,
      total_questions: data.total_questions
        ? parseInt(data.total_questions)
        : 10,
      nextQuestionTime: data.nextQuestionTime
        ? parseInt(data.nextQuestionTime)
        : 60,
      ttl: data.ttl ? parseInt(data.ttl) : 24,
      created_at: new Date(),
      status: "Created",
      countDown: 10,
    };

    let key = `quiz:data:${quizId}`;
    const ttlSeconds = (quizdata?.ttl ?? 24) * 3600;
    await this.redis.set(key, JSON.stringify(quizdata), "EX", ttlSeconds);

    logger.success(
      `Quiz ${quizId} created by user ${userid} with mode ${mode}`,
    );

    await this.queueManager.push({
      type: "CREATE_QUIZ",
      id: quizId,
      payload: { quizId, userid, examtype: "Quiz" },
      variant: "Quiz",
      category: "JECA",
    });

    return quizId;
  }

  // --- Real-time Methods (from WSworker) ---

  async addUser(
    quizId: string,
    userId: string,
    name: string,
    avatar?: string | null,
  ) {
    const meta = await this.getQuizMetaData(quizId);
    if (!meta) throw new Error("Quiz not found");

    const isMember = await this.redis.sismember(`quiz:users:${quizId}`, userId);
    if (isMember) {
      await this.redis.set(
        `user:profile:${userId}`,
        JSON.stringify({ name, avatar }),
        "EX",
        86400,
      );
      return;
    }

    await this.redis.sadd(`quiz:users:${quizId}`, userId);
    await this.redis.expire(`quiz:users:${quizId}`, 86400);
    await this.redis.set(
      `user:profile:${userId}`,
      JSON.stringify({ name, avatar }),
      "EX",
      86400,
    );

    // Only set score to 0 if the user doesn't already have a score (prevent reset on rejoin)
    const existingScore = await this.redis.zscore(
      `quiz:leaderboard:${quizId}`,
      userId,
    );
    if (existingScore === null) {
      await this.redis.zadd(`quiz:leaderboard:${quizId}`, 0, userId);
      await this.redis.expire(`quiz:leaderboard:${quizId}`, 86400);
    }

    const count = await this.redis.scard(`quiz:users:${quizId}`);
    if (count >= meta.limit) {
      await this.startQuiz(quizId);
    }
  }

  async removeUser(quizId: string, userId: string) {
    await this.redis.srem(`quiz:users:${quizId}`, userId);
    logger.debug(`User ${userId} removed from quiz ${quizId}`);
  }

  async isUserExist(quizId: string, userId: string): Promise<boolean> {
    const exists = await this.redis.sismember(`quiz:users:${quizId}`, userId);
    return exists === 1;
  }

  async getQuizMetaData(quizId: string): Promise<QuizMetaData | null> {
    const data = await this.redis.get(`quiz:data:${quizId}`);
    return data ? JSON.parse(data) : null;
  }

  async startQuiz(quizId: string) {
    const metadata = await this.getQuizMetaData(quizId);
    if (!metadata) return;

    const lockKey = `quiz:active_loop:${quizId}`;
    const acquired = await this.redis.set(lockKey, "LOCKED", "EX", 7200, "NX");
    if (!acquired) return;

    const countDown = metadata.countDown ?? 10;
    const startTime = new Date(Date.now() + countDown * 1000);

    await this.redis.set(`quiz:state:${quizId}`, "countdown", "EX", 7200);
    await this.redis.set(
      `quiz:startTime:${quizId}`,
      startTime.toISOString(),
      "EX",
      7200,
    );

    const message = {
      type: "QUIZ_STARTED",
      payload: { quizId, startTime, message: "Quiz starting..." },
      rooms: [quizId],
    };

    await this.redis.publish("WS_BROADCAST", JSON.stringify(message));
    this.scheduleQuizTimer(quizId, countDown * 1000, 1);
  }

  private scheduleQuizTimer(
    quizId: string,
    delay: number,
    questionIndex: number,
  ) {
    this.cancelQuizTimer(quizId);
    const timer = setTimeout(() => {
      this.activeQuizTimers.delete(quizId);
      this.runQuestionLoop(quizId, questionIndex);
    }, delay);
    this.activeQuizTimers.set(quizId, timer);
  }

  public cancelQuizTimer(quizId: string) {
    const timer = this.activeQuizTimers.get(quizId);
    if (timer) {
      clearTimeout(timer);
      this.activeQuizTimers.delete(quizId);
    }
  }

  async runQuestionLoop(quizId: string, questionNumber: number) {
    const meta = await this.getQuizMetaData(quizId);
    if (!meta) {
      this.cancelQuizTimer(quizId);
      await this.redis.del(`quiz:active_loop:${quizId}`);
      return;
    }

    if (questionNumber === 1) {
      await this.redis.set(`quiz:state:${quizId}`, "running", "EX", 7200);
    }

    if (questionNumber > meta.total_questions) {
      await this.endQuizBroadcast(quizId);
      return;
    }

    const duration = (meta.nextQuestionTime || 30) * 1000;
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration);

    await this.sendQuestionToRoom(quizId, questionNumber, startTime, endTime);
    this.scheduleQuizTimer(quizId, duration, questionNumber + 1);
  }

  async endQuizBroadcast(quizId: string) {
    this.cancelQuizTimer(quizId);
    await this.redis.del(`quiz:active_loop:${quizId}`);

    // Broadcast final leaderboard
    const leaderboard = await this.LeaderboardManager.getLeaderBoard(quizId);
    const leaderboardMessage = {
      type: "QUIZ_LEADERBOARD",
      payload: { leaderboard },
      rooms: [quizId],
    };
    await this.redis.publish(
      "WS_BROADCAST",
      JSON.stringify(leaderboardMessage),
    );

    const message = {
      type: "QUIZ_ENDED",
      payload: { quizId, leaderboard },
      rooms: [quizId],
    };

    await this.redis.publish("WS_BROADCAST", JSON.stringify(message));

    // Instead of immediate deletion, use a short TTL (5 minutes)
    // to allow late-arriving results and final fetches
    await this.redis.expire(`quiz:data:${quizId}`, 300);
    await this.redis.expire(`quiz:users:${quizId}`, 300);
    await this.redis.expire(`quiz:leaderboard:${quizId}`, 300);
  }

  async sendQuestionToRoom(
    quizId: string,
    questionNumber: number,
    startTime: Date,
    endTime: Date,
  ) {
    const questionStr = await this.redis.get(
      `quizquestion:${quizId}:part1:${questionNumber}`,
    );
    if (!questionStr) return;

    const question = JSON.parse(questionStr);
    const data = {
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

    await this.redis.set(
      `quiz:question:startTime:${quizId}:${questionNumber}`,
      startTime.toISOString(),
      "EX",
      300,
    );
    await this.redis.set(
      `quiz:question:endTime:${quizId}:${questionNumber}`,
      endTime.toISOString(),
      "EX",
      300,
    );

    const message = {
      type: "QUESTION",
      payload: {
        quizId,
        question: data,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      },
      rooms: [quizId],
    };

    await this.redis.publish("WS_BROADCAST", JSON.stringify(message));
  }

  async submitAnswer(
    quizId: string,
    userId: string,
    userans: string[],
    number: number,
    isMultiple: boolean,
    submissionTimeIso: string,
  ) {
    const alreadyAnswered = await this.redis.hexists(
      `quiz:submissions:${quizId}:${userId}`,
      number.toString(),
    );
    if (alreadyAnswered) throw new Error("Answer already submitted");

    // Push task to queue instead of processing here
    await this.queueManager.push({
      type: "QUIZ_ANS_PROCESSING",
      id: `${quizId}:${userId}:${number}`,
      payload: {
        quizId,
        userId,
        userans,
        number,
        isMultiple,
        timestamp: submissionTimeIso,
      },
    });
  }

  async getAllActiveQuizzes(): Promise<QuizMetaData[]> {
    const keys = await this.redis.keys("quiz:data:*");
    if (keys.length === 0) return [];

    const data = await this.redis.mget(keys);
    return data
      .filter((d): d is string => d !== null)
      .map((d) => JSON.parse(d));
  }
}
