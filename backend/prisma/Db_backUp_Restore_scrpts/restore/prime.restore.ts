import { oldPrisma, newPrisma } from "../db/index";

export async function restorePrime(chunkSize = 100) {
  const totalPrime = await oldPrisma.prime.count();
  for (let skip = 0; skip < totalPrime; skip += chunkSize) {
    const batch = await oldPrisma.prime.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      console.log("inserting prime data", data.id);

      await newPrisma.prime.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
        },
      });
    }
  }
}
