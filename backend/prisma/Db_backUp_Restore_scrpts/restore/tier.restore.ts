import { oldPrisma, newPrisma } from "../db/index";

export async function restoreTier(chunkSize = 100) {
  const alldata = await oldPrisma.tier.count();
  for (let skip = 0; skip < alldata; skip += chunkSize) {
    const batch = await oldPrisma.tier.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      console.log("inserting.tier data", data.id);

      await newPrisma.tier.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
        },
      });
    }
  }
}
