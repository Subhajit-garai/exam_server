import { oldPrisma, newPrisma } from "../db/index";

export async function restoreSyllabus(chunkSize = 100) {
  const alldata = await oldPrisma.syllabus.count();
  for (let skip = 0; skip < alldata; skip += chunkSize) {
    const batch = await oldPrisma.syllabus.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      console.log("inserting.syllabus data", data.id);

      await newPrisma.syllabus.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
          // name:
        },
      });
    }
  }
}
