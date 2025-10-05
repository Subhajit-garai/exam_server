import { oldPrisma, newPrisma } from "../db/index";

export async function restoreQuestion(chunkSize = 100) {
  const alldata = await oldPrisma.questions.count();

  for (let skip = 0; skip < alldata; skip += chunkSize) {

    const batch = await oldPrisma.questions.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      console.log("inserting.questions data", data.id);

      await newPrisma.questions.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
          extra: data.extra ? data.extra: undefined,
        },
      });
    }
  }
}
