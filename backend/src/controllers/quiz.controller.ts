import { Response, Request } from "express";
import prisma from "@repo/db/index.js";
import { asyncHandler } from "@repo/lib/helper/asyncHandler.js";
import { examManager } from "@repo/lib/manager/examManager.js";
import { create_quiz_data_ZodSchema, createQuizType } from "../zod/quiz.zod.js";

const em = examManager.getInstance();

export const test = async (req: any, res: any) => {
  try {
    res.json({ success: true, message: "message", data: "data" });
  } catch (error) {
    console.log("Error in quiz test --->", error);
  }
};

export const createQuizfn = async (userid: string, data: createQuizType) => {
  // try {
  let isUserExist = await prisma.user.findFirst({
    where: {
      id: userid,
    },
  });

  let quiz = await prisma.quiz.create({
    data: {
      ...data,
      created_by: userid,
    },
  });

  if (quiz) {
    return quiz;
  } else {
    return null;
  }
  // } catch (error) {
  //   console.log("Error in createQuiz --->", error);
  // }
};

export const createQuiz = asyncHandler(
  async (req: Request | any, res: Response) => {
    let processedData = create_quiz_data_ZodSchema.safeParse(req.body);

    if (!processedData.success)
      throw new Error("Quiz creation Data format invalid");
    let quiz = await createQuizfn(req?.user, processedData.data);
  }
);
