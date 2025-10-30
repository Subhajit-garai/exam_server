import prisma from  "@repo/db/index";
import fs, { readFileSync } from "fs";



export const sendBulkQuestionData = async (inputepath: string, userid: string) => {
  let data = JSON.parse(fs.readFileSync(inputepath, { encoding: "utf-8" }));

  data = changeUserid(userid, data);

  let length = data.length;
  const chunkSize = 300;
  if (length > chunkSize) {
    console.log("too  large data ...");

    for (let index = 0; index < length; index += chunkSize) {
      const chunk = data.slice(index, index + chunkSize);
      console.log("---------------------------------------");
      await bulkQuestionCreate(chunk);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    console.log("process finished ");
  } else {
    bulkQuestionCreate(data);
  }
};

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
  console.log("totalquestions ___> ", count);
  return processeddata;
};

export const bulkQuestionCreate = async (bulkData: any) => {
  const result = await prisma.questions.createMany({
    data: bulkData,
    skipDuplicates: true, // Optional: skips records with duplicate unique keys
  });

  console.log("result", result);

  if (!result) {
    throw new Error("question not created");
  }
};