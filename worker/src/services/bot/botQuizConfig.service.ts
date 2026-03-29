import prisma from "@repo/db/index.js";


export class BotQuizConfigService {




    async getQuizConfig(chatid: string | number) {
        chatid = String(chatid)
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
    async createConfig(data: any, userId: string) {


        return await prisma.botQuizConfig.create({
            data: {
                ...data,
                created_by: userId,
            },
        });
    }

    async updateConfig(id: string, data: any) {
        return await prisma.botQuizConfig.update({
            where: { id },
            data,
        });
    }

    async deleteConfig(id: string) {
        return await prisma.botQuizConfig.delete({
            where: { id },
        });
    }

    async getConfigById(id: string) {
        return await prisma.botQuizConfig.findUnique({
            where: { id },
        });
    }

    async getAllConfigs(query: any = {}) {
        const { page = 1, limit = 10, ...filter } = query;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            prisma.botQuizConfig.findMany({
                where: filter,
                skip,
                take: Number(limit),
                orderBy: { created_at: "desc" },
            }),
            prisma.botQuizConfig.count({ where: filter }),
        ]);

        return { data, total, page, limit };
    }
}
