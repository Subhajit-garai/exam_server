import prisma from  "@repo/db/index";
import fs, { readFileSync } from "fs";



export const sendBulkQuestionData = async (inputepath: string, userid: string ,subjectid: string,topicid: string) => {
  let data = JSON.parse(fs.readFileSync(inputepath, { encoding: "utf-8" }));

  data = changeUserid(userid, data,subjectid,topicid);

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

export const changeUserid = (userid: string, data: any,subjectid: string,topicid: string) => {
  let count = 0;
  let processeddata = data.map((d: any) => {
    d.created_by = userid;
    count++;
    delete d.number;
    d.old_topic = d.topic;
    d.old_sub_topic = d.sub_topic;
    d.topic_id = topicid;
    d.subject_id = subjectid;
    d.format = d.formate;
    delete d.formate;
    delete d.topic;
    delete d.sub_topic;
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