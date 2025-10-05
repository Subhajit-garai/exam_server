import { oldPrisma, newPrisma } from "../db/index";

export async function restoreLeaderboard(chunkSize = 100) {
  const alldata = await oldPrisma.leaderboard.count();
  for (let skip = 0; skip < alldata; skip += chunkSize) {
    const batch = await oldPrisma.leaderboard.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      console.log("inserting.leaderboard data", data.id);

      await newPrisma.leaderboard.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
        },
      });
    }
  }
}
