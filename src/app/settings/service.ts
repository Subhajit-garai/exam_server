import { db } from "@repo/db/index.js";
import { bot_infos } from "@repo/db/schema/bot.js";
import { app_configs } from "@repo/db/schema/schema.js";
import { users } from "@repo/db/schema/user.js";
import { eq } from "drizzle-orm";

export class SettingsService {
    async getAllBotUsers() {
        const bots = await db.select({
            User: {
                id: users.id,
                name: users.name,
            }
        })
            .from(bot_infos)
            .innerJoin(users, eq(bot_infos.bot_user_id, users.id));

        if (!bots) {
            throw Error("no bot user found");
        }
        return bots;
    }

    async getAppConfig() {
        return await db.select().from(app_configs);
    }

    async updateAppConfig(feature: any, status: any) {
        const [updateSetting] = await db.update(app_configs)
            .set({ settings: { status: status } })
            .where(eq(app_configs.feature, feature))
            .returning();

        if (!updateSetting) {
            throw Error("setting not updated");
        }

        return updateSetting;
    }
}
