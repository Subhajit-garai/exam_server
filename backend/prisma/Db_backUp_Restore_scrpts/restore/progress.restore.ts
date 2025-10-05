import { oldPrisma, newPrisma } from "../db/index";

export async function restoreProgress(chunkSize = 100) {
  const totalprogress = await oldPrisma.progress.count();
  for (let skip = 0; skip < totalprogress; skip += chunkSize) {
    const batch = await oldPrisma.progress.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      console.log("inserting progress data", data.id);

      await newPrisma.progress.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
        },
      });
    }
  }
}
