import { Response, Request } from "express";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { activity_quiz_create_data_ZodSchema } from "@/zod/quiz.zod.js";
import { QuizService } from "./service.js";
import { ZodDataSafeParse } from "@/utils/ZodTypeChecker.js";

const quizService = new QuizService();

export const test = asyncHandler(async (req: any, res: any) => {
  res.json({ success: true, message: "message", data: "data" });
});

export const getLeaderboard = asyncHandler(async (req: any, res: any) => {
  let id = req.query.id;
  let leaderboard = await quizService.getLeaderboard(id as string);
  res.json({ success: true, message: "message", data: leaderboard });
});

export const createUserQuiz = asyncHandler(
  async (req: Request | any, res: Response) => {
    let porcessData = activity_quiz_create_data_ZodSchema.safeParse(req.body);

    if (!porcessData.success) {
      throw ZodDataSafeParse(porcessData, true);
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
