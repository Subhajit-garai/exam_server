import { asyncHandler } from "@/lib/helper/asyncHandler.js";
import { BotService } from "../../services/bot/bot.service.js";

const botService = new BotService();

export const updatExamCrationStatus = asyncHandler(async (req: any, res: any) => {
  const examid = req.params.examid;
  const data = await botService.exam.checkExamCompletionStatus(examid);
  res.json({
    success: true,
    message: "message",
    data: data,
  });
});

export const getMockSetExamPattern = asyncHandler(async (req: any, res: any) => {
  const title = req.params.title;
  const data = await botService.exam.getMockSetExamPattern(title);
  res.json({ success: true, message: "message", data: data });
});

export const getExamPatternId = asyncHandler(async (req: any, res: any) => {
  const examid = req.params.examid;
  const data = await botService.exam.getExamPatternId(examid);
  res.json({
    success: true,
    message: "message",
    data: data,
  });
});

export const getExamPattern = asyncHandler(async (req: any, res: any) => {
  const exampatternid = req.params.exampatternid;
  const data = await botService.exam.getExamPattern(exampatternid);
  res.json({
    success: true,
    message: "message",
    data: data,
  });
});
