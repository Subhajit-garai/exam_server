import { RedisProvider } from "../redisProvider.js";
import {
    exam_question_format_for_ui_type,
    exam_question_format_type,
} from "../questionTypes.js";
import { logger } from "src/utils/logger.js";
import { WsMessage, StartQuizPayload, QuestionPayload, EndQuizPayload } from "../types/ws.types.js";
import { shuffleArraySeeded } from "../../utils/shuffle.js";

interface QuizMetaData {
    id: string;
    total_questions: number;
    nextQuestionTime: number;
    quizOpenFor: number;
    topics: string[];
    subjects: string[];
    limit: number;
}

interface User {
    id: string;
}


export class QuizManager {

    private static instance: QuizManager;
    private redisProvider: RedisProvider;
    private redis: any; // Direct ioredis client

    public static getInstance() {
        if (!this.instance) {
            this.instance = new QuizManager();
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

    async addUser(quizId: string, userId: string) {
        const meta = await this.getQuizMetaData(quizId);
        if (!meta) throw new Error("Quiz not found");

        const isMember = await this.redis.sismember(`quiz:users:${quizId}`, userId);
        if (isMember) {
            logger.info(`[QUIZ_ADD_USER] User ${userId} already in quiz ${quizId}`);
            return;
        }
        await this.redis.sadd(`quiz:users:${quizId}`, userId);
        logger.success(`[QUIZ_ADD_USER] User ${userId} added to quiz ${quizId}`);

        const count = await this.redis.scard(`quiz:users:${quizId}`);
        logger.info(`[QUIZ_ADD_USER] Quiz ${quizId} count: ${count}/${meta.limit}`);

        if (count >= meta.limit) {
            logger.success(`[QUIZ_START] Quiz ${quizId} limit reached (${count} users). Starting...`);
            await this.startQuiz(quizId);
        }
    }

    async removeUser(quizId: string, userId: string) {
        await this.redis.srem(`quiz:users:${quizId}`, userId);
        logger.info(`[QUIZ_REMOVE_USER] User ${userId} removed from quiz ${quizId}`);
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
        await this.redis.del(`quiz:data:${quizId}`);
        await this.redis.del(`quiz:users:${quizId}`);
        await this.redis.del(`quiz:active_loop:${quizId}`);
        await this.redis.del(`quiz:startTime:${quizId}`);
        await this.redis.del(`quiz:leaderboard:${quizId}`);
        // Consider deleting all question start/end times if possible, or let them expire via TTL
        logger.info(`[QUIZ_REMOVE] Quiz ${quizId} removed`);
    }

    async startQuiz(quizId: string) {
        // 1. Get count (optional, just for logging/validation)
        const count = await this.redis.scard(`quiz:users:${quizId}`);
        if (count === 0) return;

        // Prevent duplicate loops
        const lockKey = `quiz:active_loop:${quizId}`;
        const acquired = await this.redis.setnx(lockKey, "LOCKED");
        if (acquired === 0) {
            logger.info(`[QUIZ_START] Quiz ${quizId} loop already active.`);
            return;
        }
        // Auto-expire lock after 2 hours (just in case)
        await this.redis.expire(lockKey, 7200);

        // Set Quiz Start Time (Expire in 2 hours)
        await this.redis.set(`quiz:startTime:${quizId}`, new Date().toISOString(), "EX", 7200);

        const message: WsMessage<StartQuizPayload> = {
            userIds: [],
            type: "QUIZ_STARTED",
            payload: {
                quizId,
                startTime: new Date(),
                message: "Quiz started! Good luck."
            }
        };

        await this.redis.publish("WS_BROADCAST", JSON.stringify(message));
        logger.success(`[QUIZ_START] Quiz ${quizId} started for ${count} users.`);

        // Start the Question Loop
        this.runQuestionLoop(quizId, 1);
    }

    async runQuestionLoop(quizId: string, questionNumber: number) {
        const meta = await this.getQuizMetaData(quizId);
        if (!meta) {
            logger.error(`[QUIZ_LOOP] Meta not found for ${quizId}`);
            return;
        }

        // Check if we are done
        if (questionNumber > meta.total_questions) {
            await this.endQuizBroadcast(quizId);
            return;
        }

        const durationMs = meta.nextQuestionTime * 1000;
        // Ensure duration is reasonable, default to 30s if missing/zero to prevent infinite fast loops
        const safeDuration = durationMs > 0 ? durationMs : 30000;

        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + safeDuration);

        // Send the question
        await this.sendQuestionToRoom(quizId, questionNumber, startTime, endTime);

        // Schedule next question
        logger.info(`[QUIZ_LOOP] Scheduling question ${questionNumber + 1} for ${quizId} in ${safeDuration}ms`);
        setTimeout(() => {
            this.runQuestionLoop(quizId, questionNumber + 1);
        }, safeDuration);
    }

    async endQuizBroadcast(quizId: string) {
        const message: WsMessage<EndQuizPayload> = {
            userIds: [],
            type: "QUIZ_ENDED",
            payload: {
                quizId
            }
        };
        await this.redis.publish("WS_BROADCAST", JSON.stringify(message));
        logger.success(`[QUIZ_END] Auto-ended quiz ${quizId}`);

        // Optional: Clean up or persist final state
        await this.removeQuiz(quizId);
    }

    async sendQuestionToRoom(quizId: string, questionNumber: number, startTime?: Date, endTime?: Date) {
        const questionStr = await this.redis.get(`quizquestion:${quizId}:part1:${questionNumber}`);
        if (!questionStr) {
            logger.error(`[QUESTION_SEND_FAIL] Question not found: ${quizId} # ${questionNumber}`);
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
        await this.redis.set(`quiz:question:startTime:${quizId}:${questionNumber}`, sTime.toISOString(), "EX", 300);
        await this.redis.set(`quiz:question:endTime:${quizId}:${questionNumber}`, eTime.toISOString(), "EX", 300);

        const message: WsMessage<QuestionPayload> = {
            userIds: [],
            type: "QUESTION",
            payload: {
                quizId,
                question: data,
                startTime: sTime.toISOString(),
                endTime: eTime.toISOString()
            }
        };

        await this.redis.publish("WS_BROADCAST", JSON.stringify(message));
        logger.success(`[QUESTION_SENT] Question ${questionNumber} sent to quiz ${quizId}`);
    }
    // --- Question Management ---

    async getQuestion(
        type: "pre" | "next" | "current",
        quizId: string,
        userId: string,
        currentNumber: number,
        shouldShuffle: boolean = true
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
            const questionStr = await this.redis.get(`quizquestion:${quizId}:part1:${number}`);
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

            if (shouldShuffle && data.question.options && data.question.options.length > 0) {
                const seed = `${quizId}:${userId}:${number}`;
                const { shuffled } = shuffleArraySeeded(data.question.options, seed);
                data.question.options = shuffled;
            }

            return data;
        }
        return null;
    }
    // --- Submission ---

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

    async getQuestionAnswer(quizId: string, number: number) {
        const questionStr = await this.redis.get(`quizquestionans:${quizId}:part1:${number}`);
        if (!questionStr) throw Error("Question data not found");
        const question = JSON.parse(questionStr);
        return question;
    }

    async submitAnswer(
        quizId: string,
        userId: string,
        ans: string[],
        number: number,
        isMultiple: boolean,
        submissionTimeIso: string
    ) {
        // 1. Time Validation & Calculation
        let timeTaken = 0;
        const questionStartTimeStr = await this.redis.get(`quiz:question:startTime:${quizId}:${number}`);
        const questionEndTimeStr = await this.redis.get(`quiz:question:endTime:${quizId}:${number}`);

        if (questionEndTimeStr && questionStartTimeStr) {
            const allowedEndTime = new Date(questionEndTimeStr).getTime();
            const startTimestamp = new Date(questionStartTimeStr).getTime();
            const submissionTime = new Date(submissionTimeIso).getTime();

            // Calculate time taken in seconds
            timeTaken = (submissionTime - startTimestamp) / 1000;
            if (timeTaken < 0) timeTaken = 0; // Should not happen but safety first

            // Add a small buffer (e.g., 5 seconds) for network latency
            const bufferMs = 5000;

            if (submissionTime > allowedEndTime + bufferMs) {
                logger.error(`[LATE_SUBMISSION] User ${userId} submitted late for Q${number} in ${quizId}`);
                throw new Error("Submission rejected: Time is up");
            }
        }

        let questionAnsData = await this.getQuestionAnswer(quizId, number); // not shuffle options
        let questionData = await this.getQuestion("current", quizId, userId, number, false); // DO NOT shuffle options for validation

        if (!questionData || !questionAnsData) throw Error("Answer processing failed");

        let score = 0;
        if (isMultiple) {
            score = ans.filter((ans) => questionData.question.options.includes(ans)).length;
        } else {
            score = ans[0] === questionData.question.options[0] ? 1 : 0;
        }

        // 2. Store Detailed Submission
        const submissionData = {
            questionId: questionData.question.questionid,
            questionNumber: number,
            userAnswer: ans,
            correct: score > 0, // Simplified correct check
            score,
            timeTaken,
            timestamp: submissionTimeIso
        };

        // Store in a Hash for this user: Key = quiz:submissions:{quizId}:{userId}, Field = questionNumber
        await this.redis.hset(
            `quiz:submissions:${quizId}:${userId}`,
            number.toString(),
            JSON.stringify(submissionData)
        );
        // Expiry for submission data (24h)
        await this.redis.expire(`quiz:submissions:${quizId}:${userId}`, 86400);
        // 3. Update Leaderboard (Score)

        console.log("score ---> ", score);



        await this.incrementScore(quizId, userId, score);

        logger.info(`[ANSWER_STORED] User ${userId} scored ${score} in ${timeTaken}s for Q${number}`);
    }


    async CalculateTime(time: string) {
        // let quizdata = await this.getQuizMetaData(time);

    }

    async incrementScore(quizId: string, userId: string, score: number) {
        // Use ZINCRBY for Sorted Set Leaderboard


        console.log(" userid", userId, "score ---> ", score);

        const key = `quiz:leaderboard:${quizId}`;
        await this.redis.zincrby(key, score, userId);
        // Ensure 24h TTL
        await this.redis.expire(key, 86400);
    }
}
