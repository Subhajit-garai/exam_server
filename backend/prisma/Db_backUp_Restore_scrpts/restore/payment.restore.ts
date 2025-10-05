import { oldPrisma, newPrisma } from "../db/index";

export async function restorePayment(chunkSize = 100) {
  const alldata = await oldPrisma.payment.count();
  for (let skip = 0; skip < alldata; skip += chunkSize) {
    const batch = await oldPrisma.payment.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      console.log("inserting.payment data", data.id);

      await newPrisma.payment.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
        },
      });
    }
  }
}
