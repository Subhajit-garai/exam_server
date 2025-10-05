import { oldPrisma, newPrisma } from "../db/index";

export async function restoreExam_pattern(chunkSize = 100) {
  const totalExam_pattern = await oldPrisma.exam_pattern.count();
  for (let skip = 0; skip < totalExam_pattern; skip += chunkSize) {
    const batch = await oldPrisma.exam_pattern.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      console.log("inserting.exam_pattern data", data.id);

      await newPrisma.exam_pattern.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...data,
        },
      });
    }
  }
}
