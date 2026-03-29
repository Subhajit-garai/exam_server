import { asyncHandler } from "@/lib/helper/asyncHandler.js";
import { BotService } from "../../services/bot/bot.service.js";

const botService = new BotService();

export const getMockAns = asyncHandler(async (req: any, res: any) => {
  const mockid = req.params.mockid;
  const ans = await botService.exam.getExamAnswers(mockid);
  res.json({ success: true, message: "Ans proccessing complete ", data: ans });
});

export const getExamAns = asyncHandler(async (req: any, res: any) => {
  const examid = req.params.examid;
  const ans = await botService.exam.getExamAnswers(examid);
  res.json({ success: true, message: "Ans proccessing complete ", data: ans });
});

export const SetUserans = asyncHandler(async (req: any, res: any) => {
  const { userid, examid, questionid, shuffleMap, selectedOption } = req.body;

  await botService.score.setUserAnswer({
    userid,
    examid,
    questionid,
    shuffleMap,
    selectedOption,
  });

  res.json({
    success: true,
    message: "user ans added into db",
    data: "no data ",
  });
});

export const getUserans = asyncHandler(async (req: any, res: any) => {
  const { userid, examid } = req.params;
  const userAns = await botService.score.getUserAnswer(userid, examid);
  res.json({ success: true, message: "message", data: userAns });
});
