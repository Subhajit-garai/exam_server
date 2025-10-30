import { Prisma } from  "@repo/packages/prisma";;
import { oldPrisma, newPrisma } from "../db/index";

export async function restoreAnsSheet(chunkSize = 100) {
  const totalansSheet = await oldPrisma.ansSheet.count();
  console.log("total ansSheet records to restore:", totalansSheet);
  
  for (let skip = 0; skip < totalansSheet; skip += chunkSize) {
    const batch = await oldPrisma.ansSheet.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      console.log("inserting ansSheet data", data.id);

      await newPrisma.ansSheet.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
          ans:data.ans? data.ans : Prisma.JsonNull,
        },
      });
    }
  }
}
