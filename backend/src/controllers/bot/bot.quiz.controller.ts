import { asyncHandler } from "@/lib/helper/asyncHandler.js";
import { botPlatform } from "@repo/prisma/client.js";
import { QuizeSetupFunction } from "@/lib/helper/TelegramQuiz.js";
import { bot_create_quiz_data_ZodSchema } from "@/zod/bot.zod.js";
import { BotService } from "../../services/bot.service.js";

const botService = new BotService();

export const sentQuizData = async (req: any, res: any) => {
  try {
    const data = bot_create_quiz_data_ZodSchema.safeParse(req.body);

    if (!data.success) {
      return res.status(403).json({ success: false, message: "invalid data" });
    }
    // Keeping this external call here as it's a specific helper function
    const Notifystatus = await QuizeSetupFunction(req.bot_user, data.data);

    if (Notifystatus) {
      res.json({
        success: true,
        message: " quiz setup completed successfully",
      });
    } else {
      res.status(400).json({ success: false, message: "server error" });
    }
  } catch (error) {
    console.log("error in getQuizData in bot controller", error);
  }
};

export const getQuizTopic = async (req: any, res: any) => {
  try {
    // Logic was commented out in original file
    return res.json({
      success: true,
      message: " topic sended successfully",
      data: null,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getQuizConfigdData = asyncHandler(async (req: any, res: any) => {
  const { chatid, platform } = req.query;

  let config;
  if (platform === botPlatform.TELEGRAM) {
    config = await botService.telegram.getQuizConfig(chatid);
  }

  return res.json({ success: true, message: "quiz config ", data: config });
});