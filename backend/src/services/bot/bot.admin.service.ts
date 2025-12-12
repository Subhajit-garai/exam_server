import { veryfyhashPasswordFn } from "@/lib/security/hash.js";
import { genToken } from "@/lib/token.js";
import prisma from "@repo/db/index.js";
import { SocialPlatform, UserRole } from "@repo/prisma/client.js";

export class BotAdminService {

    async updateBotWebhook(botUserId: string, data: any) {
        const { name, newvalue, type } = data;

        let oldWebhookMap = {
            webhook: { baseurl: "", endpoint: {} },
        };

        const oldWebhook = await prisma.botInfo.findFirst({
            where: { botuser_id: botUserId },
        });

        if (oldWebhook?.webhook) {
            oldWebhookMap.webhook = oldWebhook.webhook as any;
        }

        let newWebhookData = {};

        switch (type) {
            case "endpoint":
                if (!name) throw new Error("Name is required");
                newWebhookData = {
                    ...oldWebhookMap.webhook,
                    endpoint: {
                        ...oldWebhookMap.webhook.endpoint,
                        [name]: newvalue,
                    },
                };
                break;
            default:
                newWebhookData = {
                    ...oldWebhookMap.webhook,
                    baseurl: newvalue,
                };
        }

        return await prisma.botInfo.update({
            where: { botuser_id: botUserId },
            data: { webhook: newWebhookData },
        });
    }

    async createBotUser(data: any, hashedPassword: string) {
        const { name, email, telegramid, bottoken } = data;

        const isUserExist = await prisma.user.findUnique({
            where: { email, role: UserRole.Bot },
        });

        if (isUserExist) throw new Error("Bot already exists, please log in");

        const bot = await prisma.user.create({
            data: {
                name,
                email,
                role: UserRole.Bot,
                prime: { create: { status: "None" } }, // Assuming 'None' is string or enum
                balance: { create: { amount: 1, ticket: 1, last_update: new Date() } },
                password: hashedPassword,
            },
        });

        await prisma.examProgress.create({ data: { userId: bot.id } });
        await prisma.dppProgress.create({ data: { userId: bot.id } });
        await prisma.quizProgress.create({ data: { userId: bot.id } });

        await prisma.botInfo.create({
            data: {
                botuser_id: bot.id,
                token: bottoken,
                webhook: { baseurl: "", endpoint: {} },
            },
        });

        return bot;
    }

    async addBotToken(botUserId: string, token: string) {
        return await prisma.botInfo.create({
            data: { token, botuser_id: botUserId },
        });
    }

    async botLogin(data: any) {
        const { email, password } = data;

        let responce = await prisma.user.findFirst({
            where: { email: email, role: UserRole.Bot },
            select: { id: true, password: true },
        });

        if (!responce) {
            throw new Error("bot_login not found");
        }

        let isVerified = veryfyhashPasswordFn(password, responce?.password);

        if (!isVerified) {
            throw new Error("bot not verified");
        }
        let newToken = genToken(responce.id);
        return newToken;
    }
}
