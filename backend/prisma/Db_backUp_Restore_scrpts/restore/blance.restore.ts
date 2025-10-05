import { oldPrisma, newPrisma } from "../db/index";

export async function restoreblance(chunkSize = 100) {
  const alldata = await oldPrisma.blance.count();
  for (let skip = 0; skip < alldata; skip += chunkSize) {
    const batch = await oldPrisma.blance.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      console.log("inserting.blance data", data.id);

      await newPrisma.blance.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
        },
      });
    }
  }
}
