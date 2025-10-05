import { oldPrisma, newPrisma } from "../db/index";

export async function restoreEntryChargeList(chunkSize = 100) {
  const alldata = await oldPrisma.entryChargeList.count();
  for (let skip = 0; skip < alldata; skip += chunkSize) {
    const batch = await oldPrisma.entryChargeList.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      console.log("inserting.entryChargeList data", data.id);

      await newPrisma.entryChargeList.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
        },
      });
    }
  }
}
