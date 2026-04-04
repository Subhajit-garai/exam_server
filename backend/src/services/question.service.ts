import { diffcultlevel, Prisma } from "@repo/prisma/client.js";
import prisma from "@repo/db/index.js";
import { questionInput_type } from "@/zod/question.zod.js";
import { logger } from "@/lib/helper/logger.js";

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

        // Explicitly partial update to prevent issues with strict mode or unknown fields
        const {
            title,
            options,
            extra,
            ans,
            format,
            category,
            topic_id,
            subject_id,
            old_topic,
            old_sub_topic,
            history,
            explanation,
            links,
            is_multiple_ans,
            created_by,
            difficulty,
            status,
            weight,
        } = data;

        let question = await prisma.question.update({
            where: {
                id: data.id,
            },
            data: {
                ...(title && { title: title }),
                ...(options && { options: options }),
                ...(extra && { extra: extra }),
                ...(ans && { ans: ans }),
                ...(format && { format: format }),
                ...(category && { category: category }),

                ...(topic_id && { topic_id: topic_id }),
                ...(subject_id && { subject_id: subject_id }),
                ...(old_topic && { old_topic: old_topic }),
                ...(old_sub_topic && { old_sub_topic: old_sub_topic }),

                ...(history && { history: history }),
                ...(explanation && { explanation: explanation }),
                ...(links && { links: links }),
                ...(is_multiple_ans !== undefined && { is_multiple_ans: is_multiple_ans }),
                ...(created_by && { created_by: created_by }),
                ...(difficulty && { difficulty: difficulty }),
                ...(status && { status: status }),
                ...(weight !== undefined && { weight: weight }),

                // Handle JSON null explicity if extra is null in input, though zod handles optional
                ...(data.extra === null ? { extra: Prisma.JsonNull } : {}),
            },
        });

        return question;
    }

    async deleteQuestion(userId: string, questionId: string) {
        let user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true },
        });

        if (!user) {
            throw new Error("User not found");
        }

        // Check for dependencies before delete
        // Check if question is in any exam/quiz map
        // Note: This logic depends on business requirements.
        // If we want to allow delete even if used, we might violate FK constraints unless cascade is on.
        // Assuming we want to block if used.

        // Check Question Map (Exams)
        const usageInExams = await prisma.question_map.count({
            where: { questionid: questionId },
        });

        if (usageInExams > 0) {
            throw new Error(`Cannot delete: Question is used in ${usageInExams} exam(s).`);
        }

        // Check Quiz Map
        const usageInQuizzes = await prisma.quiz_question_map.count({
            where: { questionid: questionId },
        });

        if (usageInQuizzes > 0) {
            throw new Error(`Cannot delete: Question is used in ${usageInQuizzes} quiz(zes).`);
        }

        // Check User Answers
        const userAnswers = await prisma.userAns.count({
            where: { questionId: questionId }
        });

        if (userAnswers > 0) {
            throw new Error(`Cannot delete: Question has ${userAnswers} user answers recorded.`);
        }

        let question = await prisma.question.delete({
            where: {
                id: questionId,
            },
        });

        return question;
    }

    async getQuestionExplanation(questionId: string) {
        let data = await prisma.question.findFirst({
            where: { id: questionId },
            select: {
                explanation: true,
                links: true,
            },
        });
        return data;
    }

    async checkQuestion(title: string) {
        let responce = await prisma.question.findMany({
            where: {
                title: {
                    contains: title,
                },
            },
        });
        return responce;
    }

    async createQuestion(userId: string, data: questionInput_type
    ) {
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
            title,
            options,
            ans,
            format,
            category,
            difficulty,
            isMultiple,
            explanation,
            extra,
            subject,
            topic,
            status,
            history,
            links,
        } = data;

        if (!subject) {
            subject = "unknown";
        }

        if (!topic) {
            topic = "unknown";
        }


        let subjectData = await prisma.subject.findUnique({
            where: {
                name: subject,
            },
            select: {
                id: true,
            },
        });

        if (!subjectData) {
            throw new Error(`Subject data not found for this ${subject}`);
        }
        let topicData = await prisma.topic.findUnique({
            where: {
                name: topic
            },
            select: {
                id: true,
            },
        });

        if (!topicData) {
            throw new Error(`Topic data not found for this ${topic}`);
        }
        let question = await prisma.question.create({
            data: {
                title: title,
                options: options,
                extra: extra,
                ans: ans,
                format: format,
                category: category,
                old_sub_topic: subject,
                old_topic: topic,
                topic_id: topicData?.id,
                subject_id: subjectData?.id,
                ...(status ? { status: status } : { status: "Processing" }),
                ...(history ? { history: history } : { history: [""] }),
                ...(links ? { links: links } : { links: [""] }),
                explanation: explanation,
                is_multiple_ans: isMultiple,
                difficulty: difficulty as diffcultlevel,
                created_by: user.id,
            },
        });

        return question;
    }

    async getQuestion(questionId: string) {
        let responce = await prisma.question.findUnique({
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
        let responce = await prisma.question.findUnique({
            where: {
                id: questionId,
            },
        });
        return responce;
    }

    async getAllQuestions(filters: any, page: number = 1) {
        let {
            category,
            difficulty,
            format,
            status,
            id,
            title,
            ismultipleans,
            links,
            history,
            subject,
            topic,
            categoryid,
            created_by
        } = filters;

        const questionsPerPage = 16;
        let responce;

        let subjectid: string = ""
        let topicid: string = ""


        if (subject) {
            let subRes = await prisma.subject.findUnique({
                where: {
                    name: subject,
                },
                select: {
                    id: true,
                    name: true
                },
            })

            if (!subRes) {
                throw new Error("Subject not found");
            }

            subjectid = subRes.id

            if (topic) {
                let topicRes = await prisma.topic.findUnique({
                    where: {
                        name: topic,
                    },
                    select: {
                        id: true,
                        name: true
                    },
                })

                if (!topicRes) {
                    throw new Error("Topic not found");
                }

                topicid = topicRes.id
            }



        }

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
                ...(category && { category: category }), // Removed toUpperCase to allow exact match or case sensitive if needed, or keep consistent with frontend
                ...(difficulty && { difficulty: difficulty }),
                ...(format && { format: format }),
                ...(status && { status: status }),
                ...(filtertitle && { title: filtertitle }),
                ...(ismultipleans !== undefined && { is_multiple_ans: ismultipleans }),
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
                ...(subjectid && { subject_id: subjectid }),
                ...(topicid && { topic_id: topicid }),
                ...(categoryid && { categoryid: categoryid }),
                ...(created_by && { created_by: created_by }),
            };


        const queryOptions: any = {
            where: Formatedfilter,
            include: {
                Topic: { select: { name: true } },
                Subject: { select: { name: true } }
            }
        };

        if (!id) {
            queryOptions.skip = (page - 1) * questionsPerPage;
            queryOptions.take = questionsPerPage;
            queryOptions.orderBy = { id: "desc" };
        }

        responce = await prisma.question.findMany(queryOptions);

        const total = await prisma.question.count({
            where: Formatedfilter,
        });
        return { questions: responce, total: total, currentPage: page };
    }

    async backupQuestion() {
        let responce = await prisma.question.findMany({});
        const total = await prisma.question.count({});
        return { questions: responce, total: total };
    }

    async getSubjectCounts(category?: string) {
        let categoryIdFilter: string | undefined;

        if (category) {
            const categoryData = await prisma.category.findFirst({
                where: { name: category },
                select: { id: true }
            });
            if (categoryData) {
                categoryIdFilter = categoryData.id;
            } else {
                return []; // Category not found, no questions to group
            }
        }

        const counts = await prisma.question.groupBy({
            by: ['subject_id'],
            where: {
                ...(categoryIdFilter && { categoryid: categoryIdFilter }),
            },
            _count: {
                id: true
            }
        });

        if (counts.length === 0) return [];

        const subjectIds = counts.reduce((acc, c) => {
            if (c.subject_id) acc.push(c.subject_id);
            return acc;
        }, [] as string[]);

        if (subjectIds.length === 0) return [];

        const subjects = await prisma.subject.findMany({
            where: {
                id: {
                    in: subjectIds
                }
            },
            select: {
                id: true,
                name: true,
            }
        });

        const subjectMap = new Map();
        for (const s of subjects) {
            subjectMap.set(s.id, s.name);
        }

        const result = counts.reduce((acc, c) => {
            if (c.subject_id && subjectMap.has(c.subject_id)) {
                acc.push({
                    id: c.subject_id,
                    subject: subjectMap.get(c.subject_id),
                    count: c._count.id
                });
            }
            return acc;
        }, [] as any[]);

        return result.sort((a: any, b: any) => b.count - a.count);
    }

    async getTopicCounts(subjectId: string, category?: string) {
        let categoryIdFilter: string | undefined;

        if (category) {
            const categoryData = await prisma.category.findFirst({
                where: { name: category },
                select: { id: true }
            });
            if (categoryData) {
                categoryIdFilter = categoryData.id;
            } else {
                return []; // Category not found, return early
            }
        }

        const counts = await prisma.question.groupBy({
            by: ['topic_id'],
            where: {
                subject_id: subjectId,
                ...(categoryIdFilter && { categoryid: categoryIdFilter }),
            },
            _count: {
                id: true
            }
        });

        if (counts.length === 0) return [];

        const topicIds = counts.reduce((acc, c) => {
            if (c.topic_id) acc.push(c.topic_id);
            return acc;
        }, [] as string[]);

        if (topicIds.length === 0) return [];

        const topics = await prisma.topic.findMany({
            where: {
                id: {
                    in: topicIds
                }
            },
            select: {
                id: true,
                name: true,
            }
        });

        const topicMap = new Map();
        for (const t of topics) {
            topicMap.set(t.id, t.name);
        }

        const result = counts.reduce((acc, c) => {
            if (c.topic_id && topicMap.has(c.topic_id)) {
                acc.push({
                    id: c.topic_id,
                    topic: topicMap.get(c.topic_id),
                    count: c._count.id
                });
            }
            return acc;
        }, [] as any[]);

        return result.sort((a: any, b: any) => b.count - a.count);
    }
}
