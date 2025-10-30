import { Prisma } from  "@repo/packages/prisma";;
import { oldPrisma, newPrisma } from "../db/index";

export async function restoreScore(chunkSize = 100) {
  const alldata = await oldPrisma.score.count();
  for (let skip = 0; skip < alldata; skip += chunkSize) {
    const batch = await oldPrisma.score.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      console.log("insertingoldPrisma.score data", data.id);
      // console.log("data", data);
      await newPrisma.score.create({
        data: {
          user_id: data.user_id,
          exam_id: data.exam_id,
          time: data.time,

          score: data.score,
          not_attempt: data.not_attempt,
          total_questions: data.total_questions,
          topic_wise_result: data.topic_wise_result
            ? data.topic_wise_result
            : Prisma.JsonNull, // Handle potential null values
          result: data.result ? data.result : Prisma.JsonNull, // Handle potential null values
        },
      });

      // await newPrisma.score.upsert({
      //   where: {
      //     user_id_exam_id_time: {
      //       user_id: data.user_id,
      //       exam_id: data.exam_id,
      //       time: data.time,
      //     },
      //     // id: data.id, // Use the unique ID for upsert
      //   },
      //   update: {
      //     // id: data.id, // Ensure the ID is updated
      //     score: data.score,
      //     not_attempt: data.not_attempt,
      //     total_questions: data.total_questions,
      //     topic_wise_result: data.topic_wise_result
      //       ? data.topic_wise_result
      //       : Prisma.JsonNull, // Handle potential null values
      //     result: data.result ? data.result : Prisma.JsonNull, // Handle potential null values
      //   },
      //   create: {
      //     ...data,
      //     topic_wise_result: data.topic_wise_result
      //       ? data.topic_wise_result
      //       : Prisma.JsonNull, // Handle potential null values
      //     result: data.result ? data.result : Prisma.JsonNull, // Handle potential null values
      //   },
      // });
    }
  }
}
