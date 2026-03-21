import { RedisProvider } from "@/utils/redisProvider.js";
import {
  exam_question_format_for_ui_type,
  exam_question_format_type,
} from "@/types/questionTypes.js";
import { logger } from "@/utils/logger.js";
import {
  WsMessage,
  StartQuizPayload,
  QuestionPayload,
  EndQuizPayload,
  QuizLeaderboardPayload,
} from "@/types/ws.types.js";
import { shuffleArraySeeded } from "@/utils/shuffle.js";
import { LeaderboardManager } from "./leaderboardManager.js";

interface QuizMetaData {
  id: string;
  total_questions: number;
  nextQuestionTime: number;
  quizOpenFor: number;
  topics: string[];
  subjects: string[];
  limit: number;
  countDown: number;
}

export type leaderboard_type = {
  name: string;
  avatar: string;
  score: string;
}



export class QuizManager {
  private static instance: QuizManager;
  private redisProvider: RedisProvider;
  private LeaderboardManager: LeaderboardManager;
  private redis: any; // Direct ioredis client
  private leaderboardTimers: Map<string, NodeJS.Timeout> | null = null;
  private activeQuizTimers: Map<string, NodeJS.Timeout> = new Map();

  public static getInstance() {
    if (!this.instance) {
      this.instance = new QuizManager();
    }
    return this.instance;
  }

  private constructor() {
    this.redisProvider = RedisProvider.getInstance();
    this.redis = this.redisProvider.getclient();
    this.LeaderboardManager = LeaderboardManager.getInstance();
  }

  getRedisClient() {
    return this.redisProvider;
  }
  // --- User Management (Redis Sets) ---

  async addUser(quizId: string, userId: string, name: string, avatar?: string) {
    logger.info(`[QUIZ_ADD_USER] Adding user ${userId} to quiz ${quizId}`);

    const meta = await this.getQuizMetaData(quizId);
    if (!meta) throw new Error("Quiz not found");

    const isMember = await this.redis.sismember(`quiz:users:${quizId}`, userId);

    if (isMember) {
      logger.info(`[QUIZ_ADD_USER] User ${userId} already in quiz ${quizId}`);
      // Update user details even if already member, in case they changed
      await this.redis.set(
        `user:profile:${userId}`,
        JSON.stringify({ name, avatar }),
        "EX",
        86400,
      );
      return;
    }

    await this.redis.sadd(`quiz:users:${quizId}`, userId);
    await this.redis.expire(`quiz:users:${quizId}`, 86400); // Ensure TTL

    // Store user details globally
    await this.redis.set(
      `user:profile:${userId}`,
      JSON.stringify({ name, avatar }),
      "EX",
      86400,
    );

    // Initialize user in leaderboard with 0 score
    await this.redis.zadd(`quiz:leaderboard:${quizId}`, 0, userId);
    await this.redis.expire(`quiz:leaderboard:${quizId}`, 86400); // Ensure TTL

    logger.success(`[QUIZ_ADD_USER] User ${userId} added to quiz ${quizId}`);

    const count = await this.redis.scard(`quiz:users:${quizId}`);
    logger.info(`[QUIZ_ADD_USER] Quiz ${quizId} count: ${count}/${meta.limit}`);

    // send quiz info to user

    if (count >= meta.limit) {
      logger.success(
        `[QUIZ_START] Quiz ${quizId} limit reached (${count} users). Starting...`,
      );
      await this.startQuiz(quizId);
    }
  }

  async removeUser(quizId: string, userId: string) {
    await this.redis.srem(`quiz:users:${quizId}`, userId);
    logger.info(
      `[QUIZ_REMOVE_USER] User ${userId} removed from quiz ${quizId}`,
    );
  }

  async isUserExist(quizId: string, userId: string): Promise<boolean> {
    const exists = await this.redis.sismember(`quiz:users:${quizId}`, userId);
    return exists === 1;
  }
  // --- Quiz Metadata (Redis Hashes) ---
  async getQuizMetaData(quizId: string): Promise<QuizMetaData | null> {
    const data = await this.redis.get(`quiz:data:${quizId}`);
    return data ? JSON.parse(data) : null;
  }

  async removeQuiz(quizId: string) {
    const pipeline = this.redis.pipeline();

    pipeline.del(`quiz:active_loop:${quizId}`);
    pipeline.del(`quiz:startTime:${quizId}`);
    pipeline.del(`quiz:leaderboard:${quizId}`);
    pipeline.del(`quiz:state:${quizId}`);

    await pipeline.exec();

    logger.info(`[QUIZ_REMOVE] Quiz ${quizId} cleaned`);
  }

  async startQuiz(quizId: string) {
    const metadata = await this.getQuizMetaData(quizId);
    if (!metadata) return;

    const lockKey = `quiz:active_loop:${quizId}`;

    const acquired = await this.redis.set(lockKey, "LOCKED", "NX", "EX", 7200);

    if (!acquired) {
      logger.info(`[QUIZ_START] Loop already running for ${quizId}`);
      return;
    }

    const count = await this.redis.scard(`quiz:users:${quizId}`);
    if (count === 0) return;

    const countDown = metadata.countDown ?? 10;

    const startTime = new Date(Date.now() + countDown * 1000);

    await this.redis.set(`quiz:state:${quizId}`, "countdown", "EX", 7200);
    await this.redis.set(
      `quiz:startTime:${quizId}`,
      startTime.toISOString(),
      "EX",
      7200,
    );

    const message: WsMessage<StartQuizPayload> = {
      userIds: [],
      type: "QUIZ_STARTED",
      payload: {
        quizId,
        startTime,
        message: "Quiz starting...",
      },
      rooms: [quizId],
    };

    await this.redis.publish("WS_BROADCAST", JSON.stringify(message));

    this.scheduleQuizTimer(quizId, countDown * 1000, 1);
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

  // restoreActiveQuizzes() is not called
  async restoreActiveQuizzes() {
    const keys = await this.redis.keys("quiz:active_loop:*");

    for (const key of keys) {
      const quizId = key.split(":")[2];

      const ttl = await this.redis.pttl(key);

      if (ttl > 0) {
        this.scheduleQuizTimer(quizId, ttl, 1);
      } else {
        await this.redis.del(key);
      }
    }
  }
  // --- Question  schudle Management ---

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

  async endQuizBroadcast(quizId: string) {
    this.cancelQuizTimer(quizId);
    await this.redis.del(`quiz:active_loop:${quizId}`);

    const message: WsMessage<EndQuizPayload> = {
      userIds: [],
      type: "QUIZ_ENDED",
      payload: {
        quizId,
      },
      rooms: [quizId],
    };

    await this.redis.publish("WS_BROADCAST", JSON.stringify(message));
    logger.success(`[QUIZ_END] Auto-ended quiz ${quizId}`);

    // Optional: Clean up or persist final state
    await this.removeQuiz(quizId);
  }

  async sendQuestionToRoom(
    quizId: string,
    questionNumber: number,
    startTime?: Date,
    endTime?: Date,
  ) {
    const questionStr = await this.redis.get(
      `quizquestion:${quizId}:part1:${questionNumber}`,
    );
    if (!questionStr) {
      logger.error(
        `[QUESTION_SEND_FAIL] Question not found: ${quizId} # ${questionNumber}`,
      );
      return;
    }

    const question: exam_question_format_type = JSON.parse(questionStr);
    if (!question.question) throw Error("Question content missing");

    const data: exam_question_format_for_ui_type = {
      number: question.number,
      part: question.part,
      question: {
        questionid: question.question.id,
        title: question.question.title,
        options: question.question.options, // WARNING: Not shuffled here if they were supposed to be
        extra: question.question.extra,
        format: question.question.format,
        is_multiple_ans: question.question.is_multiple_ans,
      },
    };

    // If times are provided, Use them. If not (manual call?), use current time.
    const sTime = startTime || new Date();
    const eTime = endTime || new Date(sTime.getTime() + 30000); // Default 30s if not loop-driven

    // Store start time for validation (Expire in 5 mins)
    await this.redis.set(
      `quiz:question:startTime:${quizId}:${questionNumber}`,
      sTime.toISOString(),
      "EX",
      300,
    );
    await this.redis.set(
      `quiz:question:endTime:${quizId}:${questionNumber}`,
      eTime.toISOString(),
      "EX",
      300,
    );

    const message: WsMessage<QuestionPayload> = {
      userIds: [],
      type: "QUESTION",
      payload: {
        quizId,
        question: data,
        startTime: sTime.toISOString(),
        endTime: eTime.toISOString(),
      },
      rooms: [quizId],
    };

    await this.redis.publish("WS_BROADCAST", JSON.stringify(message));
    logger.success(
      `[QUESTION_SENT] Question ${questionNumber} sent to quiz ${quizId}`,
    );
  }
  // --- Question Management ---

  // return question , which is formated for quiz question display
  async getQuestion(
    type: "pre" | "next" | "current",
    quizId: string,
    userId: string,
    currentNumber: number,
    shouldShuffle: boolean = true,
  ) {
    const isValidUser = await this.isUserExist(quizId, userId);
    if (!isValidUser) return null;

    const meta = await this.getQuizMetaData(quizId);
    if (!meta) throw new Error("Quiz metadata not found");

    let number = currentNumber;
    const totalQuestions = meta.total_questions;

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
      const questionStr = await this.redis.get(
        `quizquestion:${quizId}:part1:${number}`,
      );
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

      if (
        shouldShuffle &&
        data.question.options &&
        data.question.options.length > 0
      ) {
        const seed = `${quizId}:${userId}:${number}`;
        const { shuffled } = shuffleArraySeeded(data.question.options, seed);
        data.question.options = shuffled;
      }

      return data;
    }
    return null;
  }
  // --- Submission ---

  async getQuizQuestionAns(quizId: string, number: number): Promise<string | number> {
    const questionStr = await this.redis.get(
      `quizquestion:${quizId}:part1:${number}`,
    );
    if (!questionStr) throw Error("Question data not found");
    let question = JSON.parse(questionStr);
    return question.question.ans;
  }
  // return full info of question
  async getQuizQuestioninfo(quizId: string, number: number) {
    const questionStr = await this.redis.get(
      `quizquestion:${quizId}:part1:${number}`,
    );
    if (!questionStr) throw Error("Question data not found");
    let question = JSON.parse(questionStr);
    return question.question;
  }

  async submitQuiz(quizId: string, userId: string) {
    await this.removeUser(quizId, userId);
    return await this.redisProvider.push({
      type: "CREATE_SCORE", // Reusing existing type
      id: quizId,
      payload: {
        quizid: quizId,
        userid: userId,
      },
    });
  }

  async getUserQuestionAnswer(quizId: string, userId: string) {

    logger.info(`[USER_QUESTION_ANSWER] Quiz ID: ${quizId}, User ID: ${userId}`);
    const userSubmissions = await this.redis.hgetall(
      `quiz:submissions:${quizId}:${userId}:*`,
    );
    if (!userSubmissions) throw Error("Question data not found");
    return JSON.parse(userSubmissions);
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

    if (alreadyAnswered) {
      throw new Error("Answer already submitted");
    }

    let timeTaken = await this.CalculateTime(quizId, number, submissionTimeIso)

    // infomation of question 
    let questionAns = await this.getQuizQuestionAns(quizId, number); // DO NOT shuffle options for validation
    let questionData = await this.getQuizQuestioninfo(quizId, number)

    if (!questionAns || !questionData) throw Error("Answer processing failed : can be due to time out or invalid question number");

    let score = 0;

    if (isMultiple) {
      logger.info("multiple ans");
      if (typeof questionAns !== "string") throw Error("invali multiple ans format")
      score = userans.filter((a) => questionAns.split(",").includes(a)).length;

    } else {
      let CorrectAns = typeof questionAns !== "string" ? String(questionAns) : questionAns;
      let CorrectAnsIndex = questionData.map[parseInt(userans[0]) - 1];
      score = String(CorrectAnsIndex) === CorrectAns ? 1 : 0;
      logger.info(" [score] user: ", userId, " score: ", score);
    }

    // 2. Store Detailed Submission
    const submissionData = {
      questionId: questionData.questionid,
      questionNumber: number,
      userAnswer: userans,
      correct: score > 0, // Simplified correct check
      score,
      timeTaken,
      timestamp: submissionTimeIso,
    };

    // Store in a Hash for this user: Key = quiz:submissions:{quizId}:{userId}, Field = questionNumber
    await this.redis.hset(
      `quiz:submissions:${quizId}:${userId}`,
      number.toString(),
      JSON.stringify(submissionData),
    );
    // Expiry for submission data (24h)
    await this.redis.expire(`quiz:submissions:${quizId}:${userId}`, 86400);
    // 3. Update Leaderboard (Score)
    await this.incrementScore(quizId, userId, score);
    await this.sendQuizLeaderboard(quizId);

    logger.info(
      `[ANSWER_STORED] User ${userId} scored ${score} in ${timeTaken}s for Q${number}`,
    );
  }

  async CalculateTime(quizId: string, number: number, submissionTimeIso: string): Promise<number> {
    // 1. Time Validation & Calculation
    let timeTaken = 0;
    const questionStartTimeStr = await this.redis.get(
      `quiz:question:startTime:${quizId}:${number}`,
    );
    const questionEndTimeStr = await this.redis.get(
      `quiz:question:endTime:${quizId}:${number}`,
    );

    if (questionEndTimeStr && questionStartTimeStr) {
      const allowedEndTime = new Date(questionEndTimeStr).getTime();
      const startTimestamp = new Date(questionStartTimeStr).getTime();
      const submissionTime = new Date(submissionTimeIso).getTime();

      // Calculate time taken in seconds
      timeTaken = (submissionTime - startTimestamp) / 1000;
      if (timeTaken < 0) timeTaken = 0; // Should not happen but safety first
      // Added a small buffer (e.g., 5 seconds) for network latency
      const bufferMs = 5000;
      if (submissionTime > allowedEndTime + bufferMs) {
        logger.error(
          `[LATE_SUBMISSION] User  submitted late for Q${number} in ${quizId}`,
        );
        // throw new Error("Submission rejected: Time is up");
      }

      logger.info(`[TIME_TAKEN] User time taken for Q${number} in ${quizId}: ${timeTaken}`);
    }

    return timeTaken;
  }

  async incrementScore(quizId: string, userId: string, score: number) {
    logger.info(
      `[INCREMENT_SCORE] User ${userId} scored ${score} in quiz ${quizId}`,
    );
    await this.LeaderboardManager.updateLeaderboard(quizId, userId, score);

  }

  async sendQuizLeaderboard(quizId: string) {
    if (!this.leaderboardTimers) this.leaderboardTimers = new Map();

    // If a timer already exists, skip
    if (this.leaderboardTimers.get(quizId)) return;

    this.leaderboardTimers.set(
      quizId,
      setTimeout(async () => {

        try {
          const leaderboard: leaderboard_type[] = await this.LeaderboardManager.getLeaderBoard(quizId);
          const message: WsMessage<QuizLeaderboardPayload> = {
            type: "QUIZ_LEADERBOARD",
            payload: {
              leaderboard,
            },
            rooms: [quizId],
          };

          await this.redis.publish("WS_BROADCAST", JSON.stringify(message));
          logger.success(`[LEADERBOARD] Sent leaderboard for ${quizId}`);

        } finally {
          this.leaderboardTimers?.delete(quizId);
        }
      }, 1500),
    );
  }
}
