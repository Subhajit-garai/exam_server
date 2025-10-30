import { Prisma } from  "@repo/packages/prisma";;
import { oldPrisma, newPrisma } from "../db/index";

export async function restoreTelegramGroupInfo(chunkSize = 100) {
  const alldata = await oldPrisma.telegramGroupInfo.count();
  for (let skip = 0; skip < alldata; skip += chunkSize) {
    const batch = await oldPrisma.telegramGroupInfo.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      console.log("inserting.telegramGroupInfo data", data.id);

      await newPrisma.telegramGroupInfo.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
                    features: data.features ? data.features : Prisma.JsonNull, // Handle potential null values
          
        },
      });
    }
  }
}
