import { Response, Request } from "express";
import { asyncHandler } from "@repo/lib/helper/asyncHandler.js";
import { ExamManager } from "@repo/lib/manager/examManager.js";
import { activity_quiz_create_data_ZodSchema, create_quiz_data_ZodSchema, createQuizType } from "../zod/quiz.zod.js";
import { QuizService } from "../services/quiz.service.js";
import { ZodDataSafeParse } from "@/lib/ZodTypeChecker.js";

const em = ExamManager.getInstance();
const quizService = new QuizService();

export const test = asyncHandler(async (req: any, res: any) => {

  res.json({ success: true, message: "message", data: "data" });

})


export const joinQuiz = asyncHandler(async (req: any, res: any) => {
  let id = req.query.id;

  let quiz = await quizService.joinQuiz(id, req.user);
  res.json({ success: true, message: "message", data: quiz });

})


export const createUserQuiz = asyncHandler(
  async (req: Request | any, res: Response) => {

    let porcessData = activity_quiz_create_data_ZodSchema.safeParse(req.body);

    if (!porcessData.success) {
      throw ZodDataSafeParse(porcessData, true)
    }

    let quiz = await quizService.createQuiz(req?.user, req?.userRole, porcessData.data);
    res.json({ success: true, data: quiz });
  }
);

export const getAvailableQuizzes = asyncHandler(
  async (req: Request, res: Response) => {
    const quizzes = await quizService.getAvailableQuizzes();
    res.json({ success: true, data: quizzes });
  }
);
