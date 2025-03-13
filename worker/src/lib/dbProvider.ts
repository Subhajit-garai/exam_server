import { PrismaClient } from "@prisma/client";

let prisma = new PrismaClient();

export const getExamPattern = async (id: string) => {
  try {
    let data = await prisma.exam.findFirst({});

    if (data) {
      console.log("exampattern is ", data);
    } else {
      throw new Error("data not found");
    }
  } catch (error) {
    console.log(error);
  }
};
export const updateExam = async (id: string, question: string) => {
  try {
    let data = await prisma.exam.findFirst({
      where: {
        id: id,
      },
    });

    if (data) {
      console.log("examp is ", data);
    } else {
      throw new Error("data not found");
    }
  } catch (error) {
    console.log(error);
  }
};

getExamPattern("hasdadj");
