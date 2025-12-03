import { Response, Request } from "express";
import { asyncHandler } from "@repo/lib/helper/asyncHandler.js";
import { ExamManager } from "@repo/lib/manager/examManager.js";
import { create_quiz_data_ZodSchema, createQuizType } from "../zod/quiz.zod.js";
import { QuizService } from "../services/quiz.service.js";

const em = ExamManager.getInstance();
const quizService = new QuizService();

export const test = async (req: any, res: any) => {
  try {
    res.json({ success: true, message: "message", data: "data" });
  } catch (error) {
    console.log("Error in quiz test --->", error);
  }
};


export const createUserQuiz = asyncHandler(
  async (req: Request | any, res: Response) => {
    let quiz = await quizService.createQuiz(req?.user, req?.userRole, req.body);
    res.json({ success: true, data: quiz });
  }
);

export const getAvailableQuizzes = asyncHandler(
  async (req: Request, res: Response) => {
    const quizzes = await quizService.getAvailableQuizzes();
    res.json({ success: true, data: quizzes });
  }
);
