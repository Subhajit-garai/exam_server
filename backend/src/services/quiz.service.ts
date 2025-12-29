import prisma from "@repo/db/index.js";
import { QuizeSetupFunction } from "@/lib/helper/TelegramQuiz.js";
import { QuizManager } from "@/lib/manager/quizManager.js";
import { activity_quiz_create_data_type } from "@/zod/quiz.zod";
const qm = QuizManager.getInstance();
export class QuizService {

    async getQuizConfig(chatid: string) {
        const config = await prisma.botQuizConfig.findFirst({
            where: {
                chatId: chatid,
            },
            select: {
                total_questions: true,
                topics: true,
                is_multiple_ans: true,
                nextQuestionTime: true,
                quizOpenFor: true,
            },
        });

        if (!config) throw new Error("Quiz config not found");
        return config;
    }
    async setupQuiz(botUser: string, data: any) {
        const notifyStatus = await QuizeSetupFunction(botUser, data);
        return notifyStatus;
    }

    async joinQuiz(id: string, userid: string) {
        const notifyStatus = await qm.joinQuiz(id, userid);
        return notifyStatus;
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
}
