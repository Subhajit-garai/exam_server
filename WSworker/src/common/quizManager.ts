import { RedisProvider } from "./redisProvider.js";
import prisma from "@repo/db/index.js";
import {
    exam_question_format_for_ui_type,
    exam_question_format_type,
} from "./questionTypes.js";
import { shuffleArraySeeded } from "./shuffle.js";

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

    async setQuizMetaData(quizId: string) {
        const quizData = await prisma.quiz.findUnique({
            where: { id: quizId },
            select: {
                id: true,
                question_count: true,
                nextQuestionTime: true,
                quizOpenFor: true,
                topics: true,
                subjects: true,
            },
        });

        if (!quizData) throw new Error("Quiz not valid");

        const metaData: QuizMetaData = {
            id: quizData.id,
            total_questions: quizData.question_count,
            nextQuestionTime: quizData.nextQuestionTime,
            quizOpenFor: quizData.quizOpenFor,
            topics: quizData.topics,
            subjects: quizData.subjects,
            limit: 100, // Default limit
        };

        // Store as JSON string in Redis
        await this.redis.set(`quiz:meta:${quizId}`, JSON.stringify(metaData));
    }

    async getQuizMetaData(quizId: string): Promise<QuizMetaData | null> {
        const data = await this.redis.get(`quiz:meta:${quizId}`);
        return data ? JSON.parse(data) : null;
    }

    async removeQuiz(quizId: string) {
        await this.redis.del(`quiz:meta:${quizId}`);
        await this.redis.del(`quiz:users:${quizId}`);
        console.log(`Quiz ${quizId} removed`);
    }

    async startQuiz(quizId: string) {
        // 1. Get all users
        const users = await this.redis.smembers(`quiz:users:${quizId}`);
        if (users.length === 0) return;

        // 2. Publish start message to Redis (so WS Worker can pick it up)
        const message = JSON.stringify({
            userIds: users,
            type: "QUIZ_STARTED",
            payload: {
                quizId,
                startTime: new Date(),
                message: "Quiz started! Good luck."
            }
        });

        await this.redis.publish("WS_BROADCAST", message);

        console.log(`Quiz ${quizId} started for ${users.length} users.`);
    }

    // --- Question Management ---

    async addQuiz(quizId: string) {
        const quizQuestions = await prisma.quiz_question_map.findMany({
            where: { quizid: quizId },
            select: {
                number: true,
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

        if (!quizQuestions || quizQuestions.length === 0) throw new Error("Quiz questions not found");

        const formattedQuestions: exam_question_format_type[] = quizQuestions.map((question) => {
            if (!question.question?.options) throw Error("Question does not have options");

            const { shuffled, map } = shuffleArraySeeded(question.question.options, quizId);

            return {
                number: question.number,
                part: "1",
                question: {
                    ...question.question,
                    options: shuffled,
                    map: map,
                },
            };
        });

        await this.setQuizMetaData(quizId);

        // Pipeline for performance
        const pipeline = this.redis.pipeline();
        formattedQuestions.forEach((question) => {
            pipeline.set(
                `quizquestion:${quizId}:${question.number}`,
                JSON.stringify(question),
                "EX", 86400 // Expire in 24h
            );
        });
        await pipeline.exec();
        console.log("Quiz questions added to Redis");
    }

    async getQuestion(
        type: "pre" | "next" | "current",
        quizId: string,
        userId: string,
        currentNumber: number
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
            const questionStr = await this.redis.get(`quizquestion:${quizId}:${number}`);
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

    async submitAnswer(
        quizId: string,
        userId: string,
        ans: string[],
        number: string,
        isMultiple: boolean
    ) {
        const isValidUser = await this.isUserExist(quizId, userId);
        if (!isValidUser) throw new Error("User is not in this quiz");

        return await this.redisProvider.push({
            id: quizId,
            type: "ANS_PROCESSING", // Reusing existing type
            payload: {
                quizid: quizId,
                userid: userId,
                ans: ans,
                ismultiple: isMultiple ?? false,
                number: number,
            },
        });
    }
}
