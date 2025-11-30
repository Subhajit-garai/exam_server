import { diffcultlevel, Prisma } from "@repo/prisma/client.js";
import prisma from "@repo/db/index.js";

export class QuestionService {
    async updateQuestion(userId: string, data: any) {
        let user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
            },
        });

        if (!user) {
            throw new Error("User not found");
        }

        let question = await prisma.questions.update({
            where: {
                id: data.id,
            },
            data: {
                ...data,
                ...(data.extra ? { extra: data.extra } : undefined),
                ...(data.extra === null
                    ? { extra: Prisma.JsonNull }
                    : { extra: data.extra }),
            },
        });

        return question;
    }

    async getQuestionExplanation(questionId: string) {
        let data = await prisma.questions.findFirst({
            where: { id: questionId },
            select: {
                explanation: true,
                links: true,
            },
        });
        return data;
    }

    async checkQuestion(title: string) {
        let responce = await prisma.questions.findMany({
            where: {
                title: {
                    contains: title,
                },
            },
        });
        return responce;
    }

    async createQuestion(userId: string, data: any) {
        let user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
            },
        });

        if (!user) {
            throw new Error("User not found");
        }

        let {
            Title,
            options,
            ans,
            format,
            category,
            topic_id,
            difficulty,
            isMultiple,
            Explanation,
            extra,
            subject_id,
            status,
            history,
            links,
        } = data;

        let question = await prisma.questions.create({
            data: {
                title: Title,
                options: options,
                extra: extra,
                ans: ans,
                format: format,
                category: category,

                // temp data
                old_sub_topic: "",
                old_topic: "",

                topic_id: topic_id, // change to sub_topic
                subject_id: subject_id,
                ...(status ? { status: status } : { status: "Processing" }),
                ...(history ? { history: history } : { history: [""] }),
                ...(links ? { links: links } : { links: [""] }),
                explanation: Explanation,
                is_multiple_ans: isMultiple,
                difficulty: difficulty as diffcultlevel,
                created_by: user.id,
            },
        });

        return question;
    }

    async getQuestion(questionId: string) {
        let responce = await prisma.questions.findUnique({
            where: {
                id: questionId,
            },
            select: {
                title: true,
                options: true,
            },
        });
        return responce;
    }

    async getQuestionAllDataById(questionId: string) {
        let responce = await prisma.questions.findUnique({
            where: {
                id: questionId,
            },
        });
        return responce;
    }

    async getAllQuestions(filters: any, page: number = 1) {
        let {
            category,
            topic,
            difficulty,
            formate,
            status,
            id,
            title,
            ismultipleans,
            links,
            history,
        } = filters;

        const questionsPerPage = 16;
        let responce;

        let filtertitle: any;
        if (title?.trim()) {
            filtertitle = {
                contains: title.trim(),
                mode: "insensitive", // Case-insensitive search
            };
        }
        let Formatedfilter: any = id
            ? { id: id }
            : {
                ...(category && { category: category.toUpperCase() }),
                ...(topic && { topic: topic.toUpperCase() }),
                ...(difficulty && { difficulty: difficulty }),
                ...(formate && { formate: formate }),
                ...(status && { status: status }),
                ...(filtertitle && { title: filtertitle }),
                ...(ismultipleans && { is_multiple_ans: ismultipleans }),
                ...(links && {
                    links: {
                        has: links,
                    },
                }), // array
                ...(history && {
                    history: {
                        has: history,
                    },
                }), // array
            };

        if (id) {
            responce = await prisma.questions.findMany({
                where: Formatedfilter,
                // skip: (pageNumber - 1) * questionsPerPage,
                // take: questionsPerPage,
                // orderBy: { id: "asc" },
            });
        } else {
            responce = await prisma.questions.findMany({
                where: Formatedfilter,
                skip: (page - 1) * questionsPerPage,
                take: questionsPerPage,
                orderBy: { id: "asc" },
            });
        }

        const total = await prisma.questions.count({
            where: Formatedfilter,
        });

        return { questions: responce, total: total, currentPage: page };
    }

    async backupQuestion() {
        let responce = await prisma.questions.findMany({});
        const total = await prisma.questions.count({});
        return { questions: responce, total: total };
    }
}
