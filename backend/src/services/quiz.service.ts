import prisma from "@repo/db/index.js";
import { QuizeSetupFunction } from "@/lib/helper/TelegramQuiz.js";

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
    async setupQuiz(botUser: any, data: any) {
        const notifyStatus = await QuizeSetupFunction(botUser, data);
        return notifyStatus;
    }

    async createQuiz(userid: string, data: any) {
        let quiz = await prisma.quiz.create({
            data: {
                ...data,
                created_by: userid,
            },
        });
        return quiz;
    }
}
