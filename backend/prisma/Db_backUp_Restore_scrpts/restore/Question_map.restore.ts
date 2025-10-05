import { Prisma } from "@prisma/client";
import { oldPrisma, newPrisma } from "../db/index";
import { Questions_type } from "../../../lib/types";

export type exam_question_map_format = {
  number: number;
  questionid: string;
  part: string;
  options: string[];
  ans: string[];
  examid: string;
  isSuffled: boolean;
};
export type mock_question_map_format = {
  number: number;
  questionid: string;
  part: string;
  options: string[];
  ans: string[];
  mockid: string;
  isSuffled: boolean;
};

export async function restoreQuestion_and_Mock_question_map(chunkSize = 1) {
  const totalexam = await oldPrisma.exam.count();
  for (let skip = 0; skip < totalexam; skip += chunkSize) {
    const batch = await oldPrisma.exam.findMany({
      skip,
      take: chunkSize,
      orderBy: { id: "asc" }, // Important for consistent pagination
    });

    for (const data of batch) {
      console.log("inserting exam data", data.id);

      switch (data.examtype) {
        case "PYQ":
          {
            let mockid = data.mockSetId;
            if (!mockid) throw new Error("Mock set  id dosn't have mockid");
            let mockset = await oldPrisma?.mock_questions_set.findFirst({
              where: {
                id: mockid,
              },
            });
            if (!mockset) throw new Error("mockset dosn't have mockid");

            let Questions: any = mockset.questions;

            if (
              !Questions ||
              Object.keys(Questions as Questions_type).length === 0
            ) {
              console.log("In PYQ, Questions are not present");
              continue;
            }

            Object.keys(Questions as Questions_type).map((part) => {
              Questions[part].map(async (questionid: string, idx: number) => {
                let temp: mock_question_map_format = {
                  number: idx + 1,
                  questionid: questionid,
                  part: part,
                  options: [],
                  ans: [],
                  mockid: mockid,
                  isSuffled: false,
                };

                await newPrisma?.mock_question_map.create({
                  data: {
                    ...temp,
                  },
                });
              });
            });
          }
          break;
        case "Mock":
          {
            let mockid = data.mockSetId;
            if (!mockid) throw new Error("Mock set  id dosn't have mockid");
            let mockset = await oldPrisma?.mock_questions_set.findFirst({
              where: {
                id: mockid,
              },
            });
            if (!mockset) throw new Error("mockset dosn't have mockid");

            let Questions: any = mockset.questions;

            if (
              !Questions ||
              Object.keys(Questions as Questions_type).length === 0
            ) {
              console.log("In mock, Questions are not present");
              continue;
            }

            Object.keys(Questions as Questions_type).map((part) => {
              console.log("part --->", part);

              Questions[part].map(async (questionid: string, idx: number) => {
                let temp: mock_question_map_format = {
                  number: idx + 1,
                  questionid: questionid,
                  part: part,
                  options: [],
                  ans: [],
                  mockid: mockid,
                  isSuffled: false,
                };

                await newPrisma?.mock_question_map.create({
                  data: {
                    ...temp,
                  },
                });
              });
            });
          }
          break;

        default:
          {
            let Questions: any = data.questions;

            if (
              !Questions ||
              Object.keys(Questions as Questions_type).length === 0
            ) {
              console.log("In exam, Questions are not present");
              continue;
            }

            let examid = data.id;
            Object.keys(Questions as Questions_type).map((part) => {
              console.log("part --->", part);

              Questions[part].map(async (questionid: string, idx: number) => {
                let temp: exam_question_map_format = {
                  number: idx + 1,
                  questionid: questionid,
                  part: part,
                  options: [],
                  ans: [],
                  examid: examid,
                  isSuffled: false,
                };

                await newPrisma?.question_map.create({
                  data: {
                    ...temp,
                  },
                });
              });
            });
          }
          break;
      }
    }
  }
}
