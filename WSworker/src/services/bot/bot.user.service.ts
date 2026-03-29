
import prisma from "@repo/db/index.js";

export class BotUserService {


    async getuserInfo(id: string) {


        let userdata = await prisma.user.findFirst({
            where: {
                id: id
            },
            select: {
                name: true,
                avater: true
            }
        })


        if (!userdata) throw Error("user not found")

        return userdata
    }

}



