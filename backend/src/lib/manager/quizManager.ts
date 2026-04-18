import { RedisProvider } from "../radisProvider.js";
import { CustomError } from "@/middleware/globalErrorHandler.js";
import { v4 as uuidv4 } from "uuid";
import { activity_quiz_create_data_type } from "@/zod/quiz.zod.js";
import { CreationTypes } from "@repo/prisma/enums.js";
import { logger } from "../helper/logger.js";
import type { Redis } from "ioredis";

export interface QuizMetaData {
    id: string;
    total_questions: number;
    nextQuestionTime: number;
    ttl: number;  // it is in hours that indicate quiz present in cache in how many hours , ttl - > time to live
    topic: string | "All";
    subject: string;
    limit: number;
    status: CreationTypes;
    created_by?: string;
    creator_role?: string;
    created_at: Date;
}

type leaderboard_type = {
    name: string;
    avatar: string;
    score: string;
}
export type user_data = {
    avatar?: string,
    name: string
}

export class QuizManager {
    private static instance: QuizManager;
    private redisProvider: RedisProvider;
    private redis: Redis; // Direct ioredis client

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

    // --- User Management (Redis Sets) --

    async removeUser(quizId: string, userId: string) {
        await this.redis.srem(`quiz:users:${quizId}`, userId);
        logger.debug(`User ${userId} removed from quiz ${quizId}`);
    }

    async isUserExist(quizId: string, userId: string): Promise<boolean> {
        const exists = await this.redis.sismember(`quiz:users:${quizId}`, userId);
        return exists === 1;
    }
    // --- Quiz Metadata (Redis Hashes) ---
    async CreateQuiz(userid: string, userRole: string, data: activity_quiz_create_data_type) {

        let { mode } = data;

        let limit = 1;
        let quizId = uuidv4();

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
            total_questions: data.total_questions ? parseInt(data.total_questions) : 10,
            nextQuestionTime: data.nextQuestionTime ? parseInt(data.nextQuestionTime) : 60,
            ttl: data.ttl ? parseInt(data.ttl) : 24,
            created_at: new Date(),
            status: "Created"
        }

        let key = `quiz:data:${quizId}`;

        // quiz ttl and data set

        const ttlSeconds = (quizdata?.ttl ?? 24) * 3600;
        await this.redis.set(
            key,
            JSON.stringify(quizdata),
            'EX',
            ttlSeconds
        );




        // await this.redis.expire(key, (quizdata?.ttl * 3600)); // sets expiry to 24 hours (in seconds)


        // send task to worker to fetch questions
        await this.redis.publish("FETCH_QUESTIONS", JSON.stringify({ quizId }));

        logger.success(`Quiz ${quizId} created by user ${userid} with mode ${mode}`);

        // create activity( quiz created)
        await this.redisProvider.push({
            type: "CREATE_QUIZ",
            id: quizId,
            payload: {
                quizId: quizId,
                userid: userid,
                examtype: "Quiz",
            },
            variant: "Quiz",
            category: "JECA", // hard coded exam 
        });

    }

    async removeQuiz(quizId: string) {
        await this.redis.del(`quiz:data:${quizId}`);
        await this.redis.del(`quiz:users:${quizId}`);
        logger.info(`Quiz ${quizId} removed`);
    }

    async getQuizMetaData(quizId: string): Promise<QuizMetaData | null> {
        const data = await this.redis.get(`quiz:data:${quizId}`);
        if (!data) return null;
        return JSON.parse(data);
    }

    async getAllActiveQuizzes(): Promise<QuizMetaData[]> {
        const keys = await this.redis.keys("quiz:data:*");
        if (keys.length === 0) return [];

        const quizzes: QuizMetaData[] = [];
        // Use mget for better performance if keys are many, but loop is fine for now or pipeline
        if (keys.length > 0) {
            const values = await this.redis.mget(keys);
            values.forEach((val: string | null) => {
                if (val) {
                    try {
                        quizzes.push(JSON.parse(val));
                    } catch (e) {
                        logger.error("Error parsing quiz meta", e);
                    }
                }
            });
        }

        return quizzes;
    }

    async startQuiz(quizId: string) {
        // Publish start message to Redis (so WS Worker can pick it up)
        const message = JSON.stringify({
            type: "QUIZ_STARTED",
            payload: {
                quizId,
                startTime: new Date(),
                message: "Quiz started! Good luck."
            }
        });

        await this.redis.publish("WS_BROADCAST", message);

        logger.success(`Quiz ${quizId} started`);
    }

    async sendQuizLeaderboard(quizId: string) {
        const key = `quiz:leaderboard:${quizId}`;
        const data = await this.redis.zrevrange(key, 0, -1, "WITHSCORES"); // Use zrevrange for high scores first

        if (!data || data.length === 0) {
            logger.error(`[LEADERBOARD] No data found for ${quizId}`);
            return;
        }

        const leaderboard: leaderboard_type[] = [];

        for (let i = 0; i < data.length; i += 2) {

            const userId = data[i];
            const score = data[i + 1];

            // Fetch user details from global profile
            const userDetailsStr = await this.redis.get(`user:profile:${userId}`);
            let userDetails: user_data = { name: "Unknown", avatar: "" };

            if (userDetailsStr) {
                try {
                    userDetails = JSON.parse(userDetailsStr);
                } catch (e) {
                    logger.error(`[LEADERBOARD] Failed to parse user details for ${userId}`);
                }
            }

            leaderboard.push({
                name: userDetails.name,
                avatar: userDetails.avatar ?? "P",
                score: score
            });
        }

        logger.success(`[LEADERBOARD] Sent leaderboard for ${quizId}`);
        return leaderboard;
    }
}
