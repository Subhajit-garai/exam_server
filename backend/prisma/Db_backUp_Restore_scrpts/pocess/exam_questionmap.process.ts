import { oldPrisma, newPrisma } from "../db/index";

import { Prisma } from  "@repo/packages/prisma";;

let totalcount = 1;
export async function exam_questionmap(chunkSize = 100) {
  console.log("starting Question process");

  const alldata = await newPrisma.exam.count();

  let array = [];

  for (let skip = 0; skip < alldata; skip += chunkSize) {
    const batch = await newPrisma.exam.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      if (data.examtype === "Mock") {
        if (data.mockSetId) {
          console.log("mockSetid is present");

          let questions = await newPrisma.mock_questions_set.findFirst({
            where: {
              id: data.mockSetId,
            },
            select: {
              // questions: true,
            },
          });

          // data.questions = questions?.questions || {};
        }
      }

      let temp = {
        testid: data.id,
        // questions: data.questions,
        type: data.examtype,
        mockSetId: data.mockSetId,
      };

      array.push(temp);
    }
  }

  // all exam data stored in array not add it  question map
  console.log("data ->  ", array.length);

  array.map((exam: any, idx) => {
    // console.log("inserting question_map data", exam.testid);

    Object.keys(exam.questions).map(async (part: string) => {
      let count = 1;
      let questions = exam.questions[part];

      let AllQuestionData = await newPrisma.questions.findMany({
        where: {
          id: {
            in: questions,
          },
        },
        select: {
          id: true,
          options: true,
          ans: true,
        },
      });

      if (!AllQuestionData) {
        return console.log("question not found");
      }

      AllQuestionData.map(async (question:any, idx:number) => {
        // console.log({
        //   examid: exam.type !== "Mock" ? exam.testid : null,
        //   mockid: exam.type === "Mock" ? exam.testid : null,
        //   questionid: question.id,
        //   number: idx + 1,
        // });
        // console.log("------------------------------------");
        // console.log("is mock", exam.type === "Mock");

        // console.log("exam.testid ------->", exam.testid);
        // console.log("exam. question id ------->", question.id);

        // console.log("exam. exam mockSetid ------->", exam.mockSetId);

        await newPrisma.question_map.create({
          data: {
            examid: exam.testid,
            part: part,
            questionid: question.id,
            number: idx + 1,
            // ans:question.ans,
            // options:question.options
          },
        });

        console.log("updated question -->", totalcount);
        totalcount++;
      });


    });
  });
}
