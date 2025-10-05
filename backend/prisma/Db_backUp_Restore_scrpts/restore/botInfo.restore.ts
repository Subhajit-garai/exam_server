import { Prisma } from "@prisma/client";
import { oldPrisma, newPrisma } from "../db/index";

export async function restorebotInfo(chunkSize = 100) {
  const alldata = await oldPrisma.botInfo.count();
  for (let skip = 0; skip < alldata; skip += chunkSize) {
    const batch = await oldPrisma.botInfo.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      console.log("inserting.botInfo data", data.id);

      await newPrisma.botInfo.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
                    webhook: data.webhook ? data.webhook : Prisma.JsonNull, // Handle potential null values
          
        },
      });
    }
  }
}
