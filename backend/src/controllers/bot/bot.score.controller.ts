import { asyncHandler } from "@/lib/helper/asyncHandler.js";
import { BotService } from "../../services/bot/bot.service.js";

const botService = new BotService();

export const setUserScore = asyncHandler(async (req: any, res: any) => {
  const { examid, userid } = req.query;
  const userScore = req.body;

  const score = await botService.score.setUserScore(examid, userid, userScore);

  return res.json({ success: true, message: "user score added ", data: score });
});

export const getUserScore = asyncHandler(async (req: any, res: any) => {
  const { examid, userid } = req.query;
  const data = await botService.score.getUserScore(examid, userid);

  if (!data) {
    return res.json({
      success: true,
      message: "user score not present ",
      data: null,
    });
  }

  return res.json({ success: true, message: "user score  ", data: data });
});