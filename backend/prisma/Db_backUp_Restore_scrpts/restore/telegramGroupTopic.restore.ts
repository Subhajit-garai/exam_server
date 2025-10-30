import { Prisma } from  "@repo/packages/prisma";
import { oldPrisma, newPrisma } from "../db/index";

export async function restoreTelegramGroupTopic(chunkSize = 100) {
  const alldata = await oldPrisma.telegramGroupTopic.count();
  for (let skip = 0; skip < alldata; skip += chunkSize) {
    const batch = await oldPrisma.telegramGroupTopic.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      console.log("inserting.telegramGroupTopic data", data.id);

      await newPrisma.telegramGroupTopic.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
          
        },
      });
    }
  }
}
