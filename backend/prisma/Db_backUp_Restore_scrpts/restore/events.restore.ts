import { Prisma } from "@prisma/client";
import { oldPrisma, newPrisma } from "../db/index";

export async function restoreEvents(chunkSize = 100) {
  const alldata = await oldPrisma.events.count();
  for (let skip = 0; skip < alldata; skip += chunkSize) {
    const batch = await oldPrisma.events.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      console.log("insertingoldPrisma.events data", data.id);

      await newPrisma.events.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
             data: data.data ? data.data : Prisma.JsonNull, // Handle potential null values
             conditions: data.conditions ? data.conditions : Prisma.JsonNull, // Handle potential null values
          
        },
      });
    }
  }
}
