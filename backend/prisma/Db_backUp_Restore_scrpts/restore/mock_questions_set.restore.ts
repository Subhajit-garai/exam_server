import { Prisma } from  "@repo/packages/prisma";;
import { oldPrisma, newPrisma } from "../db/index";

export async function restoreMock_questions_set(chunkSize = 100) {
  const totalData = await oldPrisma.mock_questions_set.count();
  for (let skip = 0; skip < totalData; skip += chunkSize) {
    const batch = await oldPrisma.mock_questions_set.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      console.log("inserting.mock_questions_set data", data.id);

      const { questions, ...rest } = data;

      await newPrisma.mock_questions_set.upsert({
        where: { id: rest.id },
        update: {},
        create: {
          ...rest,
          // questions: data.questions ? data.questions : Prisma.JsonNull, // Handle potential null values
          question_difficulty_weight: data.question_difficulty_weight
            ? data.question_difficulty_weight
            : Prisma.JsonNull, // Handle potential null values
          question_topic_count: data.question_topic_count
            ? data.question_topic_count
            : Prisma.JsonNull, // Handle potential null values
          question_part_count: data.question_part_count
            ? data.question_part_count
            : Prisma.JsonNull, // Handle potential null values
        },
      });
    }
  }
}
