import { db, schema } from "@/db/index.js";
import { eq, and, inArray, sql } from "drizzle-orm";
import {
    banuser_notification_zod_type,
    unbanuser_notification_zod_type,
} from "@/zod/bot.zod.js";


export class BotTelegramService {
    /**
     * Handles bot notifications (ban/unban).
     */
    async processNotification(type: string, data: any, botUserId: string | number) {
        botUserId = String(botUserId)
        switch (type) {
            case "unbanuser":
                return this.handleUnbanUser(data);
            case "banuser":
                return this.handleBanUser(data, botUserId);
            default:
                throw new Error(`Unknown notification type: ${type}`);
        }
    }

    private async handleUnbanUser(data: any) {
        const validation = unbanuser_notification_zod_type.safeParse(data);
        if (!validation.success) throw new Error("Invalid data format for unbanuser");

        const { user_id, chat_id } = validation.data;

        const banRecordResult = await db.select()
            .from(schema.telegram_ban_users)
            .where(
                and(
                    eq(schema.telegram_ban_users.user_telegram_id, String(user_id)),
                    eq(schema.telegram_ban_users.ban_from_id, String(chat_id))
                )
            )
            .limit(1);

        const banRecord = banRecordResult[0];

        if (!banRecord) throw new Error("Ban record not found or already unbanned");

        await db.delete(schema.telegram_ban_users)
            .where(
                and(
                    eq(schema.telegram_ban_users.user_telegram_id, String(user_id)),
                    eq(schema.telegram_ban_users.ban_from_id, String(chat_id))
                )
            );

        return { message: "User unbanned successfully" };
    }

    private async handleBanUser(data: any, botUserId: string | number) {
        botUserId = String(botUserId)

        const validation = banuser_notification_zod_type.safeParse(data);
        if (!validation.success) throw new Error("Invalid data format for banuser");

        const { user_id, chat_id, ban_from_type } = validation.data;

        await db.insert(schema.telegram_ban_users)
            .values({
                user_telegram_id: String(user_id),
                bot_id: String(botUserId),
                ban_from_id: String(chat_id),
                ban_from_type: ban_from_type,
                status: "Ban",
            })
            .onConflictDoNothing();

        return { message: "User banned successfully" };
    }

    async getAllUsersForTelegram() {
        const usersResult = await db.select({
            social: schema.socials,
            primeStatus: schema.primes.status
        })
            .from(schema.users)
            .leftJoin(schema.socials, and(
                eq(schema.users.id, schema.socials.user_id),
                eq(schema.socials.platform, "telegram")
            ))
            .leftJoin(schema.primes, eq(schema.users.id, schema.primes.user_id));

        if (!usersResult) throw new Error("Users not found");
        return usersResult;
    }

    async getValidChatIds() {

        const groupDatas = await db.select({
            groupid: schema.telegram_group_infos.group_id,
            groupType: schema.telegram_group_infos.group_type,
            isBanned: schema.telegram_group_infos.is_banned,
            isPremium: schema.telegram_group_infos.is_premium,
        })
            .from(schema.telegram_group_infos);

        return groupDatas
            .filter((g) => !g.isBanned)
            .map((g) => ({
                id: g.groupid,
                type: g.groupType,
                isPremium: g.isPremium,
            }));
    }

    async getGroupTopicInfo(groupId: string | number, name: string) {
        groupId = String(groupId)
        const infoResult = await db.select()
            .from(schema.telegram_group_topics)
            .innerJoin(schema.telegram_group_infos, eq(schema.telegram_group_topics.group_id, schema.telegram_group_infos.id))
            .where(
                and(
                    eq(schema.telegram_group_infos.group_id, groupId),
                    eq(schema.telegram_group_topics.name, name)
                )
            )
            .limit(1);

        if (infoResult.length === 0) throw new Error("Group topic info not available for that given  name or group id");
        
        const info = infoResult[0].telegram_group_topics;
        return {
            ...info,
            groupId: info.group_id,
            topicId: info.topic_id
        };
    }

    async getGroupInfo(chatid: string | number) {
        chatid = String(chatid)
        const res = await db.select()
            .from(schema.telegram_group_infos)
            .where(eq(schema.telegram_group_infos.group_id, chatid))
            .limit(1);
            
        if (!res[0]) return null;
        
        return {
            ...res[0],
            isTopic: res[0].is_topic,
            groupid: res[0].group_id,
            groupType: res[0].group_type,
            isBanned: res[0].is_banned,
            isPremium: res[0].is_premium
        };
    }

    async isGroupJoinable(chatid: string | number) {
        chatid = String(chatid)
        const groupInfoResult = await db.select({ is_banned: schema.telegram_group_infos.is_banned })
            .from(schema.telegram_group_infos)
            .where(eq(schema.telegram_group_infos.group_id, chatid))
            .limit(1);
        return groupInfoResult[0]?.is_banned === false;
    }

    async getUsersByRole(role: any) {
        const usersResult = await db.select({
            social: schema.socials,
            prime: { status: schema.primes.status, expiry: schema.primes.expiry }
        })
            .from(schema.users)
            .leftJoin(schema.socials, and(
                eq(schema.users.id, schema.socials.user_id),
                eq(schema.socials.platform, "telegram")
            ))
            .leftJoin(schema.primes, eq(schema.users.id, schema.primes.user_id))
            .where(eq(schema.users.role, role ?? "User"));

        if (!usersResult) throw new Error("No users found");
        return usersResult;
    }

    async isPrimeUser(telegramid: string | number) {
        telegramid = String(telegramid)
        const userTelegramdataResult = await db.select({ userId: schema.socials.user_id })
            .from(schema.socials)
            .where(
                and(
                    eq(schema.socials.platform, "telegram"),
                    eq(schema.socials.link, telegramid)
                )
            )
            .limit(1);

        const userTelegramdata = userTelegramdataResult[0];
        if (!userTelegramdata) throw new Error("User not found");


        const userResult = await db.select({ status: schema.primes.status })
            .from(schema.users)
            .leftJoin(schema.primes, eq(schema.users.id, schema.primes.user_id))
            .where(eq(schema.users.id, userTelegramdata.userId))
            .limit(1);

        const user = userResult[0];
        if (!user) throw new Error("User not found");
        return user.status !== "None";
    }

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
}
