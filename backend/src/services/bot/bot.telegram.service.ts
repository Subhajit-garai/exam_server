import prisma from "@repo/db/index.js";
import {
    banuser_notification_zod_type,
    unbanuser_notification_zod_type,
} from "../../zod/bot.zod.js";

export class BotTelegramService {
    /**
     * Handles bot notifications (ban/unban).
     */
    async processNotification(type: string, data: any, botUserId: string) {
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

        const banRecord = await prisma.telegram_ban_user.findUnique({
            where: {
                user_telegram_id_ban_from_id: {
                    user_telegram_id: user_id,
                    ban_from_id: chat_id,
                },
            },
        });

        if (!banRecord) throw new Error("Ban record not found or already unbanned");

        await prisma.telegram_ban_user.delete({
            where: {
                user_telegram_id_ban_from_id: {
                    user_telegram_id: user_id,
                    ban_from_id: chat_id,
                },
            },
        });

        return { message: "User unbanned successfully" };
    }

    private async handleBanUser(data: any, botUserId: string) {
        const validation = banuser_notification_zod_type.safeParse(data);
        if (!validation.success) throw new Error("Invalid data format for banuser");

        const { user_id, chat_id, ban_from_type } = validation.data;

        await prisma.telegram_ban_user.create({
            data: {
                user_telegram_id: user_id,
                bot_id: botUserId,
                ban_from_id: chat_id,
                ban_from_type: ban_from_type,
                status: "Ban",
            },
        });

        return { message: "User banned successfully" };
    }

    async getAllUsersForTelegram() {
        const users = await prisma.user.findMany({
            select: {
                telegram: { select: { telegramid: true } },
                prime: { select: { status: true } },
            },
        });
        if (!users) throw new Error("Users not found");
        return users;
    }

    async getValidChatIds() {
        const groupDatas = await prisma.telegramGroupInfo.findMany({
            select: {
                groupid: true,
                groupType: true,
                isBanned: true,
                isPremium: true,
            },
        });

        return groupDatas
            .filter((g) => !g.isBanned)
            .map((g) => ({
                id: g.groupid,
                type: g.groupType,
                isPremium: g.isPremium,
            }));
    }

    async getGroupTopicInfo(groupId: string, name: string) {
        const info = await prisma.telegramGroupTopic.findFirst({
            where: { id: groupId, name },
        });
        if (!info) throw new Error("Group topic info not available");
        return info;
    }

    async getGroupInfo(chatid: string) {
        return await prisma.telegramGroupInfo.findFirst({
            where: { groupid: chatid },
        });
    }

    async isGroupJoinable(chatid: string) {
        const groupInfo = await prisma.telegramGroupInfo.findFirst({
            where: { groupid: chatid },
        });
        return groupInfo?.isBanned === false;
    }

    async getUsersByRole(role: any) {
        const users = await prisma.user.findMany({
            where: { role: role ?? "User" },
            select: {
                telegram: { select: { telegramid: true } },
                prime: { select: { status: true, expiry: true } },
            },
        });
        if (!users) throw new Error("No users found");
        return users;
    }

    async isPrimeUser(telegramid: string) {
        const user = await prisma.user.findFirst({
            where: { telegram: { telegramid } },
            select: { prime: { select: { status: true } } },
        });
        if (!user) throw new Error("User not found");
        return user.prime?.status !== "None";
    }

    async getQuizConfig(chatid: string) {
        const config = await prisma.botQuizConfig.findFirst({
            where: { chatId: chatid },
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
}
