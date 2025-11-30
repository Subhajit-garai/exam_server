import { asyncHandler } from "@/lib/helper/asyncHandler.js";
import { BotService } from "../../services/bot.service.js";

const botService = new BotService();

export const getQuestionsIds = asyncHandler(async (req: any, res: any) => {
  const data = await botService.exam.getQuestionsIds();
  res.json({
    success: true,
    message: "message",
    data: data,
  });
});

export const getQuestionsByids = asyncHandler(async (req: any, res: any) => {
  const ids = req.body;
  const data = await botService.exam.getQuestionsByIds(ids);
  res.json({ success: true, message: "question info", data: data });
});

export const getQuestions = asyncHandler(async (req: any, res: any) => {
  const examid = req.body;
  const data = await botService.exam.getQuestionsForExam(examid);
  res.json({ success: true, message: "question info", data: data });
});

export const getExamQuestionAns = asyncHandler(async (req: any, res: any) => {
  res.json({ success: true, message: "message", data: "data" });
});

export const addQuestions = asyncHandler(async (req: any, res: any) => {
  const questions = req.body;
  await botService.exam.addQuestionsToExam(questions);
  return res.json({ success: true, message: "questionAdded" });
});