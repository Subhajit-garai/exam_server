import { db } from "@/db/index.js";
import { users } from "@/db/schema/index.js";
import { eq } from "drizzle-orm";

export class BotUserService {
    async getuserInfo(id: string) {
        let userdata = await db.select({
            name: users.name,
            avatar: users.avater
        })
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        if (userdata.length === 0) throw new Error("user not found");
        return userdata[0];
    }
}
