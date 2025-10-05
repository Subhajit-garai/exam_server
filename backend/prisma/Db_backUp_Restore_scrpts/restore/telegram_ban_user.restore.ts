import { oldPrisma, newPrisma } from "../db/index";

export async function restoretelegram_ban_user(chunkSize = 100) {
  const alldata = await oldPrisma.telegram_ban_user.count();
  for (let skip = 0; skip < alldata; skip += chunkSize) {
    const batch = await oldPrisma.telegram_ban_user.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      console.log("inserting.telegram_ban_user data", data.id);

      await newPrisma.telegram_ban_user.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
        },
      });
    }
  }
}
