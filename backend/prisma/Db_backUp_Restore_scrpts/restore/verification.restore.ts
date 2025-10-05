import { oldPrisma, newPrisma } from "../db/index";

export async function restoreVerification(chunkSize = 100) {
  const totalPrime = await oldPrisma.verification.count();

    for (let skip = 0; skip < totalPrime; skip += chunkSize) {
      const batch = await oldPrisma.verification.findMany({
        skip,
        take: chunkSize,
        orderBy: { id: "asc" }, // Important for consistent pagination
      });

      for (const data of batch) {
        console.log("inserting verification data", data.id);
        
         await newPrisma.verification.upsert({
          where: { id: data.id },
          update: {},
          create: {
            ...data,
          },
        });
      }
    }
}
