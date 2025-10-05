import { oldPrisma, newPrisma } from "../db/index";

export async function restoreCopon(chunkSize = 100) {
  const alldata = await oldPrisma.copon.count();
  for (let skip = 0; skip < alldata; skip += chunkSize) {
    const batch = await oldPrisma.copon.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      console.log("inserting.copon data", data.id);

      await newPrisma.coupon.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
        },
      });
    }
  }
}
