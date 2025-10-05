import { Prisma } from "@prisma/client";
import { oldPrisma, newPrisma } from "../db/index";

export async function restoreExam(chunkSize = 100) {
  const totalexam = await oldPrisma.exam.count();
  for (let skip = 0; skip < totalexam; skip += chunkSize) {
    const batch = await oldPrisma.exam.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      console.log("inserting exam data", data.id);

      const { questions, ...rest } = data;
      await newPrisma.exam.upsert({
        where: { id: data.id },
        update: {},
        create: {
          ...rest,
          // questions: data.questions ? data.questions : Prisma.JsonNull, // Handle potential null values
        },
      });
    }
  }
}
