import { Prisma } from "@prisma/client";
import { oldPrisma, newPrisma } from "../db/index";

export async function restoreUserAns(chunkSize = 100) {
  const alldata = await oldPrisma.userAns.count();
  for (let skip = 0; skip < alldata; skip += chunkSize) {
    const batch = await oldPrisma.userAns.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      console.log("insertingoldPrisma.userAns data", data.id);

      await newPrisma.userAns.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
             ans: data.ans ? data.ans : Prisma.JsonNull, // Handle potential null values
          
        },
      });
    }
  }
}
