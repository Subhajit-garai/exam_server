import { oldPrisma, newPrisma } from "../db/index";

export async function restoreTierBenefit(chunkSize = 100) {
  const alldata = await oldPrisma.tierBenefit.count();
  for (let skip = 0; skip < alldata; skip += chunkSize) {
    const batch = await oldPrisma.tierBenefit.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      console.log("inserting.tierBenefit data", data.id);

      await newPrisma.tierBenefit.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
        },
      });
    }
  }
}
