import { RedisProvider } from "../radisProvider.js";
import prisma from "@repo/db/index.js";
import {
    exam_question_format_for_ui_type,
    exam_question_format_type,
} from "../types/questionTypes.js";
import { shuffleArraySeeded } from "../helper/shuffle.js";
import { CustomError } from "@/middleware/globalErrorHandler.js";
import { v4 as uuidv4 } from "uuid";

interface QuizMetaData {
    id: string;
    total_questions: number;
    nextQuestionTime: number;
    quizOpenFor: number;
    topics: string[];
    subjects: string[];
    limit: number;
    created_by?: string;
    creator_role?: string;
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

        const count = await this.redis.scard(`quiz:users:${quizId}`);

        // Check if user is already in (to avoid double counting if rejoining)
        const isMember = await this.redis.sismember(`quiz:users:${quizId}`, userId);

        if (!isMember && count >= meta.limit) {
            // Quiz is full, start the quiz
            await this.redis.sadd(`quiz:users:${quizId}`, userId);
            console.log(`User ${userId} added to quiz ${quizId}. Quiz full, starting...`);
            await this.startQuiz(quizId);
            return;
        }

        await this.redis.sadd(`quiz:users:${quizId}`, userId);
        console.log(`User ${userId} added to quiz ${quizId}`);

        // Check again if we hit the limit after adding
        const newCount = await this.redis.scard(`quiz:users:${quizId}`);
        if (newCount >= meta.limit) {
            await this.startQuiz(quizId);
        }
    }


    async removeUser(quizId: string, userId: string) {
        await this.redis.srem(`quiz:users:${quizId}`, userId);
        console.log(`User ${userId} removed from quiz ${quizId}`);
    }

    async isUserExist(quizId: string, userId: string): Promise<boolean> {
        const exists = await this.redis.sismember(`quiz:users:${quizId}`, userId);
        return exists === 1;
    }
    // --- Quiz Metadata (Redis Hashes) ---
    async CreateQuiz(userid: string, userRole: string, data: any) {

        let { topic, subject, mode } = data;

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
                throw new CustomError("Invalid quiz type", 400);
        }

        let quizdata: QuizMetaData = {
            id: quizId,
            total_questions: 10,
            nextQuestionTime: 60,
            quizOpenFor: 50,
            subjects: subject,
            topics: topic,
            limit: limit,
            created_by: userid,
            creator_role: userRole

        }



        // Store as JSON string in Redis
        await this.redis.set(`quiz:data:${quizId}`, JSON.stringify(quizdata));

    }

    async removeQuiz(quizId: string) {
        await this.redis.del(`quiz:data:${quizId}`);
        await this.redis.del(`quiz:users:${quizId}`);
        console.log(`Quiz ${quizId} removed`);
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
                        console.error("Error parsing quiz meta", e);
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

        console.log(`Quiz ${quizId} started`);
    }
}
