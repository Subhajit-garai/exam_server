import { oldPrisma, newPrisma } from "../db/index";

export async function restoreTelegram(chunkSize = 100) {
  const totaltelegram = await oldPrisma.telegram.count();

  for (let skip = 0; skip < totaltelegram; skip += chunkSize) {
    const batch = await oldPrisma.telegram.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    // Short-lived transaction inside the loop
      for (const data of batch) {
                console.log("inserting telegram data", data.id);

        await newPrisma.telegram.upsert({
          where: { id: data.id },
          update: {}, // Add update logic if needed
          create: {
            ...data,
          },
        });
      }
  }
}
