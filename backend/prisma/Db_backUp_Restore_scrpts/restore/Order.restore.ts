import { oldPrisma, newPrisma } from "../db/index";

export async function restoreOrder(chunkSize = 100) {
  const alldata = await oldPrisma.order.count();
  for (let skip = 0; skip < alldata; skip += chunkSize) {
    const batch = await oldPrisma.order.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      console.log("inserting.order data", data.id);

      await newPrisma.order.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
        },
      });
    }
  }
}
