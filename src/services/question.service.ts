import { db } from "@repo/db/index.js";
import { questions, question_maps } from "@repo/db/schema/question.js";
import { quiz_question_maps } from "@repo/db/schema/quiz.js";
import { user_answers, users } from "@repo/db/schema/user.js";
import { subjects, topics, categories } from "@repo/db/schema/note.js";
import { eq, and, ilike, count, sql, arrayContains, desc, inArray } from "drizzle-orm";
import { questionInput_type } from "@/zod/question.zod.js";

export class QuestionService {
    async updateQuestion(userId: string, data: any) {
        const [user] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId));

        if (!user) {
            throw new Error("User not found");
        }

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

        const updatePayload: any = {
            ...(title && { title: title }),
            ...(options && { options: options }),
            ...(extra !== undefined && { extra: extra }),
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
            ...(is_multiple_ans !== undefined && { is_multiple_answers: is_multiple_ans }),
            ...(created_by && { created_by: created_by }),
            ...(difficulty && { difficulty: difficulty }),
            ...(status && { status: status }),
            ...(weight !== undefined && { weight: weight }),
        };

        const [question] = await db.update(questions)
            .set(updatePayload)
            .where(eq(questions.id, data.id))
            .returning();

        return question;
    }

    async deleteQuestion(userId: string, questionId: string) {
        const [user] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId));

        if (!user) {
            throw new Error("User not found");
        }

        const [{ value: usageInExams }] = await db.select({ value: count() }).from(question_maps).where(eq(question_maps.question_id, questionId));
        if (usageInExams > 0) {
            throw new Error(`Cannot delete: Question is used in ${usageInExams} exam(s).`);
        }

        const [{ value: usageInQuizzes }] = await db.select({ value: count() }).from(quiz_question_maps).where(eq(quiz_question_maps.question_id, questionId));
        if (usageInQuizzes > 0) {
            throw new Error(`Cannot delete: Question is used in ${usageInQuizzes} quiz(zes).`);
        }

        const [{ value: userAnswersCount }] = await db.select({ value: count() }).from(user_answers).where(eq(user_answers.question_id, questionId));
        if (userAnswersCount > 0) {
            throw new Error(`Cannot delete: Question has ${userAnswersCount} user answers recorded.`);
        }

        const [question] = await db.delete(questions).where(eq(questions.id, questionId)).returning();
        return question;
    }

    async getQuestionExplanation(questionId: string) {
        const [data] = await db.select({
            explanation: questions.explanation,
            links: questions.links,
        }).from(questions).where(eq(questions.id, questionId));
        return data;
    }

    async checkQuestion(title: string) {
        const response = await db.select().from(questions).where(ilike(questions.title, `%${title}%`));
        return response;
    }

    async createQuestion(userId: string, data: questionInput_type) {
        const [user] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId));

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

        if (!subject) subject = "unknown";
        if (!topic) topic = "unknown";

        const [subjectData] = await db.select({ id: subjects.id }).from(subjects).where(eq(subjects.name, subject));
        if (!subjectData) {
            throw new Error(`Subject data not found for this ${subject}`);
        }

        const [topicData] = await db.select({ id: topics.id }).from(topics).where(eq(topics.name, topic));
        if (!topicData) {
            throw new Error(`Topic data not found for this ${topic}`);
        }

        const [question] = await db.insert(questions).values({
            title: title,
            options: options,
            extra: extra,
            ans: ans as string[],
            format: format as any,
            category: category,
            old_sub_topic: subject,
            old_topic: topic,
            topic_id: topicData.id,
            subject_id: subjectData.id,
            status: status as any || "Processing",
            history: history || [""],
            links: links || [""],
            explanation: explanation,
            is_multiple_answers: isMultiple,
            difficulty: difficulty as any,
            created_by: user.id,
            weight: 0,
        }).returning();

        return question;
    }

    async getQuestion(questionId: string) {
        const [response] = await db.select({
            title: questions.title,
            options: questions.options,
        }).from(questions).where(eq(questions.id, questionId));
        return response;
    }

    async getQuestionAllDataById(questionId: string) {
        const [response] = await db.select().from(questions).where(eq(questions.id, questionId));
        return response;
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
        let subjectid: string = "";
        let topicid: string = "";

        if (subject) {
            const [subRes] = await db.select({ id: subjects.id, name: subjects.name }).from(subjects).where(eq(subjects.name, subject));
            if (!subRes) throw new Error("Subject not found");
            subjectid = subRes.id;

            if (topic) {
                const [topicRes] = await db.select({ id: topics.id, name: topics.name }).from(topics).where(eq(topics.name, topic));
                if (!topicRes) throw new Error("Topic not found");
                topicid = topicRes.id;
            }
        }

        const conditions = [];

        if (id) {
            conditions.push(eq(questions.id, id));
        } else {
            if (category) conditions.push(eq(questions.category, category));
            if (difficulty) conditions.push(eq(questions.difficulty, difficulty as any));
            if (format) conditions.push(eq(questions.format, format as any));
            if (status) conditions.push(eq(questions.status, status as any));
            if (title && title.trim()) conditions.push(ilike(questions.title, `%${title.trim()}%`));
            if (ismultipleans !== undefined) conditions.push(eq(questions.is_multiple_answers, ismultipleans));
            if (links) conditions.push(arrayContains(questions.links, [links]));
            if (history) conditions.push(arrayContains(questions.history, [history]));
            if (subjectid) conditions.push(eq(questions.subject_id, subjectid));
            if (topicid) conditions.push(eq(questions.topic_id, topicid));
            if (categoryid) conditions.push(eq(questions.category_id, categoryid));
            if (created_by) conditions.push(eq(questions.created_by, created_by));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        let query = db.select({
            id: questions.id,
            title: questions.title,
            options: questions.options,
            extra: questions.extra,
            ans: questions.ans,
            format: questions.format,
            category: questions.category,
            topic_id: questions.topic_id,
            subject_id: questions.subject_id,
            status: questions.status,
            history: questions.history,
            links: questions.links,
            explanation: questions.explanation,
            is_multiple_ans: questions.is_multiple_answers,
            difficulty: questions.difficulty,
            created_by: questions.created_by,
            weight: questions.weight,
            Topic: { name: topics.name },
            Subject: { name: subjects.name }
        })
            .from(questions)
            .leftJoin(topics, eq(questions.topic_id, topics.id))
            .leftJoin(subjects, eq(questions.subject_id, subjects.id))
            .where(whereClause);

        if (!id) {
            (query as any).offset((page - 1) * questionsPerPage).limit(questionsPerPage).orderBy(desc(questions.id));
        }

        const response = await query;

        const [{ value: total }] = await db.select({ value: count() }).from(questions).where(whereClause);

        return { questions: response, total: total, currentPage: page };
    }

    async backupQuestion() {
        const response = await db.select().from(questions);
        const [{ value: total }] = await db.select({ value: count() }).from(questions);
        return { questions: response, total: total };
    }

    async getSubjectCounts(category?: string) {
        let categoryIdFilter: string | undefined;

        if (category) {
            const [categoryData] = await db.select({ id: categories.id }).from(categories).where(eq(categories.name, category));
            if (categoryData) {
                categoryIdFilter = categoryData.id;
            } else {
                return [];
            }
        }

        const conditions = [];
        if (categoryIdFilter) conditions.push(eq(questions.category_id, categoryIdFilter));

        const counts = await db.select({
            subject_id: questions.subject_id,
            count: count(questions.id)
        })
            .from(questions)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .groupBy(questions.subject_id);

        if (counts.length === 0) return [];

        const subjectIds = counts.map(c => c.subject_id).filter((id): id is string => id !== null);
        if (subjectIds.length === 0) return [];

        const subjectList = await db.select({ id: subjects.id, name: subjects.name }).from(subjects).where(inArray(subjects.id, subjectIds));

        const subjectMap = new Map();
        for (const s of subjectList) {
            subjectMap.set(s.id, s.name);
        }

        const result = counts.reduce((acc, c) => {
            if (c.subject_id && subjectMap.has(c.subject_id)) {
                acc.push({
                    id: c.subject_id,
                    subject: subjectMap.get(c.subject_id),
                    count: c.count
                });
            }
            return acc;
        }, [] as any[]);

        return result.sort((a: any, b: any) => b.count - a.count);
    }

    async getTopicCounts(subjectId: string, category?: string) {
        let categoryIdFilter: string | undefined;

        if (category) {
            const [categoryData] = await db.select({ id: categories.id }).from(categories).where(eq(categories.name, category));
            if (categoryData) {
                categoryIdFilter = categoryData.id;
            } else {
                return [];
            }
        }

        const conditions = [eq(questions.subject_id, subjectId)];
        if (categoryIdFilter) conditions.push(eq(questions.category_id, categoryIdFilter));

        const counts = await db.select({
            topic_id: questions.topic_id,
            count: count(questions.id)
        })
            .from(questions)
            .where(and(...conditions))
            .groupBy(questions.topic_id);

        if (counts.length === 0) return [];

        const topicIds = counts.map(c => c.topic_id).filter((id): id is string => id !== null);
        if (topicIds.length === 0) return [];

        const topicList = await db.select({ id: topics.id, name: topics.name }).from(topics).where(inArray(topics.id, topicIds));

        const topicMap = new Map();
        for (const t of topicList) {
            topicMap.set(t.id, t.name);
        }

        const result = counts.reduce((acc, c) => {
            if (c.topic_id && topicMap.has(c.topic_id)) {
                acc.push({
                    id: c.topic_id,
                    topic: topicMap.get(c.topic_id),
                    count: c.count
                });
            }
            return acc;
        }, [] as any[]);

        return result.sort((a: any, b: any) => b.count - a.count);
    }
}

