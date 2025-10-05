import { Prisma } from "@prisma/client";
import { oldPrisma, newPrisma } from "../db/index";

export async function restoreAppConfig(chunkSize = 100) {
  const AllAppConfig = await oldPrisma.appConfig.count();
  for (let skip = 0; skip < AllAppConfig; skip += chunkSize) {
    const batch = await oldPrisma.appConfig.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      console.log("inserting.appConfig data", data.id);

      await newPrisma.appConfig.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
          settings: data.settings ? data.settings : Prisma.JsonNull, // Handle potential null values
        },
      });
    }
  }
}
