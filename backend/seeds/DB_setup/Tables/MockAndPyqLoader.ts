import { resolve } from "path";
import prisma from  "@repo/db/index";
import fs, { readFileSync } from "fs";

export const changeUserid = (userid: string, data: any) => {
  let count = 0;
  let processeddata = data.map((d: any) => {
    d.created_by = userid;
    count++;
    delete d.number;
    return {
      ...d,
    };
  });
  console.log( " total mock  ___> ", count);
  return processeddata;
};

export const sendBulkMockAndPyqData = async (
  inputepath: string,
  userid: string
) => {
  let data = JSON.parse(fs.readFileSync(inputepath, { encoding: "utf-8" }));

  if (data.mock_set) {
    // let processedData = changeUserid(userid, data.mock_set);
    await run(data.mock_set, bulk_mock_questions_set_Create);
  }

  console.log("mock_question_set added....");
  
  await new Promise((resolve) => setTimeout(resolve, 4000));

  if (data.test) {
    let processedData = changeUserid(userid, data.test);
    // await run(processedData, bulkMockAndPyqCreate);
  }
};

const run = async (data: any, fn: (d: any) => {}) => {
  let length = data.length;
  const chunkSize = 300;
  if (length > chunkSize) {
    console.log("too  large data ...");

    for (let index = 0; index < length; index += chunkSize) {
      const chunk = data.slice(index, index + chunkSize);
      console.log("---------------------------------------");
      await fn(chunk);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    console.log("process finished. ");
  } else {
    fn(data);
  }
};

// export const bulkMockAndPyqCreate = async (bulkData: any[]) => {
//   const results = [];

//   for (const data of bulkData) {
//     try {

//       const mockset = await prisma.question_map.findFirst({
//           where: { id: data.mockSetId },
//         });
//         if (!mockset) throw new Error("Mock set not found");

//         const exampattern = await prisma.exam.findFirst({
//           where: { id: mockset.mockSetId },
//         });

//         if (!exampattern) throw new Error("Exam pattern not found");

//       const trxResult = await prisma.$transaction(async (tx) => {
      

//         await tx.contestRegister.create({
//           data: {
//             id: data.register_id,
//           },
//         });

//         const exam = await tx.exam.create({
//           data: {
//             ...data,
//             exam_pattern_id: exampattern.id,
//           },
//         });

//         return exam;
//       });

//       results.push(trxResult);
//     } catch (error) {
//       console.error("❌ Transaction failed:", error);
//     }

//     // Keep if you want rate-limiting
//     await new Promise((resolve) => setTimeout(resolve, 2000));
//   }

//   return results;
// };


export const bulk_mock_questions_set_Create = async (bulkData: any) => {
  const result = await prisma.question_map.createMany({
    data: bulkData,
    skipDuplicates: true, // Optional: skips records with duplicate unique keys
  });

  if (!result) {
    throw new Error("question not created");
  }
  return result;
};
