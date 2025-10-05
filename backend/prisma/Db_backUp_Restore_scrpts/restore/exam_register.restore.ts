import { oldPrisma, newPrisma } from "../db/index";

export async function restoreexamReg(chunkSize = 100) {
  const totalexamReg = await oldPrisma.contestRegister.count();
  for (let skip = 0; skip < totalexamReg; skip += chunkSize) {
    const batch = await oldPrisma.contestRegister.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      console.log("inserting contestRegister data", data.id);

      await newPrisma.contestRegister.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
        },
      });
    }
  }
}
