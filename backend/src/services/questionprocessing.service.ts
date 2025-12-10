import { ProcessingStatus, Prisma } from "@repo/prisma/client.js";
import prisma from "@repo/db/index.js";

export class QuestionProcessingService {
    async createProcessedQuestion(userId: string, data: any) {
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

        const {
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
            status, // This might be for the question status, not processing status
            history,
            links,
            old_topic,
            old_sub_topic,
            created_at,
            question_id,
            admin_comment
        } = data;

        let question = await prisma.questionProcessing.create({
            data: {
                title: Title,
                options: options,
                extra: extra ? extra : Prisma.JsonNull,
                ans: ans,
                format: format,
                category: category,
                old_sub_topic: old_sub_topic,
                old_topic: old_topic,
                topic_id: topic_id,
                subject_id: subject_id,
                links: links ? links : ["", ""],
                explanation: Explanation,
                is_multiple_ans: isMultiple,
                status,
                history,
                difficulty: difficulty,
                created_by: user.id,
                created_at: created_at,
                processing_status: ProcessingStatus.Pending,
                question_id: question_id,
                admin_comment: admin_comment
            },
        });

        return question;
    }

    async getProcessedQuestions(filters: any, page: number = 1) {
        const { status, topic_id, subject_id } = filters;
        const take = 20;
        const skip = (page - 1) * take;

        const where: any = {};
        if (status) where.processing_status = status;
        if (topic_id) where.topic_id = topic_id;
        if (subject_id) where.subject_id = subject_id;

        const [questions, total] = await Promise.all([
            prisma.questionProcessing.findMany({
                where,
                skip,
                take,
                orderBy: { created_at: 'desc' },
                include: {
                    User: {
                        select: { name: true, email: true }
                    },
                    Subject: {
                        select: { name: true }
                    },
                    Topic: {
                        select: { name: true }
                    }
                }
            }),
            prisma.questionProcessing.count({ where })
        ]);

        return { questions, total, page };
    }

    async reviewQuestion(adminId: string, questionProcessingId: string, action: 'APPROVE' | 'REJECT', comment?: string) {
        const admin = await prisma.user.findUnique({ where: { id: adminId } });
        if (!admin || admin.role !== 'Admin') {
            throw new Error("Unauthorized: Only admins can review questions");
        }

        const processedQuestion = await prisma.questionProcessing.findUnique({
            where: { id: questionProcessingId }
        });

        if (!processedQuestion) {
            throw new Error("Processed question not found");
        }

        if (processedQuestion.processing_status !== ProcessingStatus.Pending) {
            throw new Error("Question is already processed");
        }

        const status = action === 'APPROVE' ? ProcessingStatus.Approved : ProcessingStatus.Rejected;

        // Update processing status
        await prisma.questionProcessing.update({
            where: { id: questionProcessingId },
            data: {
                processing_status: status,
                admin_comment: comment,
                processed_by: adminId,
                processed_at: new Date()
            }
        });

        if (action === 'APPROVE') {
            // Upsert to main Questions table
            const questionData = {
                title: processedQuestion.title,
                options: processedQuestion.options,
                extra: processedQuestion.extra || Prisma.JsonNull,
                ans: processedQuestion.ans,
                format: processedQuestion.format,
                category: processedQuestion.category,
                old_sub_topic: processedQuestion.old_sub_topic || "",
                old_topic: processedQuestion.old_topic || "",
                topic_id: processedQuestion.topic_id,
                subject_id: processedQuestion.subject_id,
                links: processedQuestion.links,
                explanation: processedQuestion.explanation,
                is_multiple_ans: processedQuestion.is_multiple_ans,
                difficulty: processedQuestion.difficulty,
                created_by: processedQuestion.created_by,
                status: "Created" as any // Using 'Created' from Status enum
            };

            if (processedQuestion.question_id) {
                // Update existing question
                await prisma.question.update({
                    where: { id: processedQuestion.question_id },
                    data: {
                        ...questionData,
                        status: "Updated" as any // Mark as updated
                    }
                });
            } else {
                // Create new question
                await prisma.question.create({
                    data: questionData
                });
            }
        }

        return { success: true, status };
    }

    async deleteProcessedQuestion(adminId: string, questionProcessingId: string) {
        const admin = await prisma.user.findUnique({ where: { id: adminId } });
        if (!admin || admin.role !== 'Admin') {
            throw new Error("Unauthorized: Only admins can delete processed questions");
        }

        await prisma.questionProcessing.delete({
            where: { id: questionProcessingId }
        });

        return { success: true };
    }

    async updateProcessedQuestion(adminId: string, questionProcessingId: string, data: any) {
        const admin = await prisma.user.findUnique({ where: { id: adminId } });
        if (!admin || admin.role !== 'Admin') {
            throw new Error("Unauthorized: Only admins can update processed questions");
        }

        const updatedQuestion = await prisma.questionProcessing.update({
            where: { id: questionProcessingId },
            data: {
                ...data,
                extra: data.extra ? data.extra : undefined
            }
        });

        return updatedQuestion;
    }
}
