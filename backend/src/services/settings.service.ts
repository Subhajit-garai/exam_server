import prisma from "@repo/db/index.js";

export class SettingsService {
    async getAllBotUsers() {
        const bots = await prisma.botInfo.findMany({
            select: {
                User: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!bots) {
            throw Error("no bot user found");
        }
        return bots;
    }

    async getAppConfig() {
        const settings = await prisma.appConfig.findMany({});
        return settings;
    }

    async updateAppConfig(feature: any, status: any) {
        const updateSetting = await prisma.appConfig.update({
            where: {
                feature: feature,
            },
            data: {
                settings: { status: status },
            },
        });

        if (!updateSetting) {
            throw Error("setting not updated");
        }

        return updateSetting;
    }
}
