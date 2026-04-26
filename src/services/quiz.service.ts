import { db } from "@repo/db/index.js";
import { bot_quiz_configs } from "@repo/db/schema/bot.js";
import { eq } from "drizzle-orm";
import { QuizManager, QuizMetaData } from "@/lib/manager/quizManager.js";
import { LeaderboardManager } from "@/lib/manager/leaderboardManager.js";
import type { activity_quiz_create_data_type } from "@/zod/quiz.zod.js";
const qm = QuizManager.getInstance();
const lm = LeaderboardManager.getInstance();

export class QuizService {

    async getQuizConfig(chatid: string) {
        const [config] = await db.select({
            total_questions: bot_quiz_configs.total_questions,
            topics: bot_quiz_configs.topics,
            is_multiple_ans: bot_quiz_configs.is_multiple_answers,
            nextQuestionTime: bot_quiz_configs.next_question_time,
            quizOpenFor: bot_quiz_configs.quiz_open_for,
        }).from(bot_quiz_configs).where(eq(bot_quiz_configs.chat_id, chatid));

        if (!config) throw new Error("Quiz config not found");
        return config;
    }

    async createQuiz(userid: string, userRole: string, data: activity_quiz_create_data_type) {
        // user quiz creation
        const quiz = await qm.CreateQuiz(userid, userRole, data);
        return quiz;
        //admin
    }

    async getAvailableQuizzes() {
        const cachedQuizzes = await qm.getAllActiveQuizzes();
        return cachedQuizzes;
    }

    // --- Quiz Metadata (Redis Hashes) ---
    async getQuizMetaData(quizId: string): Promise<QuizMetaData | null> {
        const data = await qm.getQuizMetaData(quizId);
        return data;
    }

    async getLeaderboard(quizId: string): Promise<any> {
        const data = await lm.getLeaderBoard(quizId);
        return data;
    }
}

