import { oldPrisma, newPrisma } from "../db/index";

export async function restoreSubcriptionOffers(chunkSize = 100) {
  const alldata = await oldPrisma.subcriptionOffers.count();
  for (let skip = 0; skip < alldata; skip += chunkSize) {
    const batch = await oldPrisma.subcriptionOffers.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      console.log("inserting.subcriptionOffers data", data.id);

      await newPrisma.subcriptionOffers.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
        },
      });
    }
  }
}
