import { db, schema } from "@/db/index.js";
import { eq, desc, count, and } from "drizzle-orm";


export class BotQuizConfigService {




    async getQuizConfig(chatid: string | number) {
        chatid = String(chatid)
        const configResult = await db.select({
            total_questions: schema.bot_quiz_configs.total_questions,
            topics: schema.bot_quiz_configs.topics,
            is_multiple_ans: schema.bot_quiz_configs.is_multiple_answers,
            nextQuestionTime: schema.bot_quiz_configs.next_question_time,
            quizOpenFor: schema.bot_quiz_configs.quiz_open_for,
        })
            .from(schema.bot_quiz_configs)
            .where(eq(schema.bot_quiz_configs.chat_id, chatid))
            .limit(1);

        const config = configResult[0];
        if (!config) throw new Error("Quiz config not found");
        return config;
    }
    async createConfig(data: any, userId: string) {

        const res = await db.insert(schema.bot_quiz_configs)
            .values({
                ...data,
                chat_id: data.chatId, // Mapping camelCase to snake_case
                is_multiple_answers: data.is_multiple_ans,
                next_question_time: data.nextQuestionTime,
                quiz_open_for: data.quizOpenFor,
                created_by: userId,
            })
            .returning();
        
        const config = res[0];
        return {
            ...config,
            chatId: config.chat_id,
            is_multiple_ans: config.is_multiple_answers,
            nextQuestionTime: config.next_question_time,
            quizOpenFor: config.quiz_open_for
        };
    }

    async updateConfig(id: string, data: any) {
        const updateData: any = { ...data };
        if (data.chatId) updateData.chat_id = data.chatId;
        if (data.is_multiple_ans !== undefined) updateData.is_multiple_answers = data.is_multiple_ans;
        if (data.nextQuestionTime) updateData.next_question_time = data.nextQuestionTime;
        if (data.quizOpenFor) updateData.quiz_open_for = data.quizOpenFor;

        const res = await db.update(schema.bot_quiz_configs)
            .set(updateData)
            .where(eq(schema.bot_quiz_configs.id, id))
            .returning();
        
        const config = res[0];
        if (!config) return null;
        return {
            ...config,
            chatId: config.chat_id,
            is_multiple_ans: config.is_multiple_answers,
            nextQuestionTime: config.next_question_time,
            quizOpenFor: config.quiz_open_for
        };
    }

    async deleteConfig(id: string) {
        const res = await db.delete(schema.bot_quiz_configs)
            .where(eq(schema.bot_quiz_configs.id, id))
            .returning();
            
        const config = res[0];
        if (!config) return null;
        return {
            ...config,
            chatId: config.chat_id,
            is_multiple_ans: config.is_multiple_answers,
            nextQuestionTime: config.next_question_time,
            quizOpenFor: config.quiz_open_for
        };
    }

    async getConfigById(id: string) {
        const res = await db.select()
            .from(schema.bot_quiz_configs)
            .where(eq(schema.bot_quiz_configs.id, id))
            .limit(1);
            
        const config = res[0];
        if (!config) return null;
        return {
            ...config,
            chatId: config.chat_id,
            is_multiple_ans: config.is_multiple_answers,
            nextQuestionTime: config.next_question_time,
            quizOpenFor: config.quiz_open_for
        };
    }

    async getAllConfigs(query: any = {}) {
        const { page = 1, limit = 10, ...filter } = query;
        const skip = (Number(page) - 1) * Number(limit);

        // Simple filter handling - can be expanded if needed
        const filterClauses: any[] = [];
        if (filter.chat_id) filterClauses.push(eq(schema.bot_quiz_configs.chat_id, filter.chat_id));

        const [data, totalResult] = await Promise.all([
            db.select()
                .from(schema.bot_quiz_configs)
                .where(and(...filterClauses))
                .limit(Number(limit))
                .offset(skip)
                .orderBy(desc(schema.bot_quiz_configs.created_at)),
            db.select({ value: count() })
                .from(schema.bot_quiz_configs)
                .where(and(...filterClauses)),
        ]);

        const mappedData = data.map(config => ({
            ...config,
            chatId: config.chat_id,
            is_multiple_ans: config.is_multiple_answers,
            nextQuestionTime: config.next_question_time,
            quizOpenFor: config.quiz_open_for
        }));

        return { data: mappedData, total: Number(totalResult[0].value), page, limit };
    }
}
