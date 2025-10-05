import { oldPrisma, newPrisma } from "../db/index";

export async function restorebotQuizConfig(chunkSize = 100) {
  const alldata = await oldPrisma.botQuizConfig.count();
  for (let skip = 0; skip < alldata; skip += chunkSize) {
    const batch = await oldPrisma.botQuizConfig.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      console.log("inserting.botQuizConfig data", data.id);

      await newPrisma.botQuizConfig.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
        },
      });
    }
  }
}
