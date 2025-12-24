import { RedisProvider } from "../redisProvider.js";
import {
    exam_question_format_for_ui_type,
    exam_question_format_type,
} from "../questionTypes.js";

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
        } else {
            console.log(" user already in quiz ");
        }
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
    async getQuizMetaData(quizId: string): Promise<QuizMetaData | null> {
        const data = await this.redis.get(`quiz:data:${quizId}`);
        return data ? JSON.parse(data) : null;
    }

    async removeQuiz(quizId: string) {
        await this.redis.del(`quiz:data:${quizId}`);
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

    async getQuestionAnswer(quizId: string, number: number) {
        const questionStr = await this.redis.get(`quizquestionans:${quizId}:${number}`);
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
        time: string
    ) {

        let questionAnsData = await this.getQuestionAnswer(quizId, number); // not shuffle options
        let questionData = await this.getQuestion("current", quizId, userId, number); // shuffle options

        if (!questionData || !questionAnsData) throw Error("Question data not found");

        let score = 0;
        if (isMultiple) {
            score = ans.filter((ans) => questionData.question.options.includes(ans)).length;
        } else {
            score = ans[0] === questionData.question.options[0] ? 1 : 0;
        }

        // add score to redis

        await this.incrementScore(quizId, userId, score);
        await this.CalculateTime(time);



    }

    async CalculateTime(time: string) {
        // let quizdata = await this.getQuizMetaData(time);

    }

    async incrementScore(quizId: string, userId: string, score: number) {

        return this.redis.hincrby(`quiz:users:${quizId}`, userId, score);
    }
}
