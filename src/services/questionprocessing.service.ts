import { db } from "@repo/db/index.js";
import { question_processing } from "@repo/db/schema/questionprocessing.js";
import { questions } from "@repo/db/schema/question.js";
import { users } from "@repo/db/schema/user.js";
import { subjects, topics } from "@repo/db/schema/note.js";
import { eq, and, desc, count } from "drizzle-orm";

export class QuestionProcessingService {
    async createProcessedQuestion(userId: string, data: any) {
        const [user] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId));

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
            status,
            history,
            links,
            old_topic,
            old_sub_topic,
            created_at,
            question_id,
            admin_comment
        } = data;

        const [question] = await db.insert(question_processing).values({
            title: Title,
            options: options,
            extra: extra ? extra : null,
            ans: ans as string[],
            format: format as any,
            category: category,
            old_sub_topic: old_sub_topic,
            old_topic: old_topic,
            topic_id: topic_id,
            subject_id: subject_id,
            links: links ? links : ["", ""],
            explanation: Explanation,
            is_multiple_answers: isMultiple,
            status: status as any || "Processing",
            history: history || [""],
            difficulty: difficulty as any,
            created_by: user.id,
            created_at: created_at ? new Date(created_at) : new Date(),
            processing_status: "Pending",
            question_id: question_id,
            admin_comment: admin_comment,
            weight: data.weight || 0,
        }).returning();

        return question;
    }

    async getProcessedQuestions(filters: any, page: number = 1) {
        const { status, topic_id, subject_id } = filters;
        const take = 20;
        const skip = (page - 1) * take;

        const conditions = [];
        if (status) conditions.push(eq(question_processing.processing_status, status as any));
        if (topic_id) conditions.push(eq(question_processing.topic_id, topic_id));
        if (subject_id) conditions.push(eq(question_processing.subject_id, subject_id));

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const results = await db.select({
            id: question_processing.id,
            title: question_processing.title,
            options: question_processing.options,
            old_topic: question_processing.old_topic,
            old_sub_topic: question_processing.old_sub_topic,
            extra: question_processing.extra,
            ans: question_processing.ans,
            topic_id: question_processing.topic_id,
            subject_id: question_processing.subject_id,
            format: question_processing.format,
            category: question_processing.category,
            difficulty: question_processing.difficulty,
            is_multiple_answers: question_processing.is_multiple_answers,
            history: question_processing.history,
            explanation: question_processing.explanation,
            links: question_processing.links,
            status: question_processing.status,
            weight: question_processing.weight,
            created_by: question_processing.created_by,
            created_at: question_processing.created_at,
            question_id: question_processing.question_id,
            processing_status: question_processing.processing_status,
            admin_comment: question_processing.admin_comment,
            processed_by: question_processing.processed_by,
            processed_at: question_processing.processed_at,
            User: { name: users.name, email: users.email },
            Subject: { name: subjects.name },
            Topic: { name: topics.name }
        })
            .from(question_processing)
            .leftJoin(users, eq(question_processing.created_by, users.id))
            .leftJoin(subjects, eq(question_processing.subject_id, subjects.id))
            .leftJoin(topics, eq(question_processing.topic_id, topics.id))
            .where(whereClause)
            .offset(skip)
            .limit(take)
            .orderBy(desc(question_processing.created_at));

        const [{ value: total }] = await db.select({ value: count() }).from(question_processing).where(whereClause);

        return { questions: results, total, page };
    }

    async reviewQuestion(adminId: string, questionProcessingId: string, action: 'APPROVE' | 'REJECT', comment?: string) {
        const [admin] = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, adminId));
        if (!admin || admin.role !== 'Admin') {
            throw new Error("Unauthorized: Only admins can review questions");
        }

        const [processedQuestion] = await db.select().from(question_processing).where(eq(question_processing.id, questionProcessingId));

        if (!processedQuestion) {
            throw new Error("Processed question not found");
        }

        if (processedQuestion.processing_status !== "Pending") {
            throw new Error("Question is already processed");
        }

        const newStatus = action === 'APPROVE' ? "Approved" : "Rejected";

        await db.update(question_processing).set({
            processing_status: newStatus,
            admin_comment: comment,
            processed_by: adminId,
            processed_at: new Date()
        }).where(eq(question_processing.id, questionProcessingId));

        if (action === 'APPROVE') {
            const questionData = {
                title: processedQuestion.title,
                options: processedQuestion.options,
                extra: processedQuestion.extra || null,
                ans: processedQuestion.ans,
                format: processedQuestion.format,
                category: processedQuestion.category,
                old_sub_topic: processedQuestion.old_sub_topic || "",
                old_topic: processedQuestion.old_topic || "",
                topic_id: processedQuestion.topic_id,
                subject_id: processedQuestion.subject_id,
                links: processedQuestion.links,
                explanation: processedQuestion.explanation,
                is_multiple_answers: processedQuestion.is_multiple_answers,
                difficulty: processedQuestion.difficulty,
                created_by: processedQuestion.created_by,
                status: "Created" as any,
                weight: processedQuestion.weight || 0,
            };

            if (processedQuestion.question_id) {
                await db.update(questions).set({
                    ...questionData,
                    status: "Updated" as any
                }).where(eq(questions.id, processedQuestion.question_id));
            } else {
                await db.insert(questions).values(questionData);
            }
        }

        return { success: true, status: newStatus };
    }

    async deleteProcessedQuestion(adminId: string, questionProcessingId: string) {
        const [admin] = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, adminId));
        if (!admin || admin.role !== 'Admin') {
            throw new Error("Unauthorized: Only admins can delete processed questions");
        }

        await db.delete(question_processing).where(eq(question_processing.id, questionProcessingId));

        return { success: true };
    }

    async updateProcessedQuestion(adminId: string, questionProcessingId: string, data: any) {
        const [admin] = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, adminId));
        if (!admin || admin.role !== 'Admin') {
            throw new Error("Unauthorized: Only admins can update processed questions");
        }

        const updatePayload = {
            ...data,
            extra: data.extra ? data.extra : undefined
        };

        const [updatedQuestion] = await db.update(question_processing).set(updatePayload).where(eq(question_processing.id, questionProcessingId)).returning();

        return updatedQuestion;
    }
}

