import { asyncHandler } from "@/lib/helper/asyncHandler";
import { botPlatform } from "@repo/prisma/client";
import prisma from "@repo/db/index";
import { QuizeSetupFunction } from "@/lib/helper/TelegramQuiz";
import { bot_create_quiz_data_ZodSchema } from "@/zod/bot.zod";






export const sentQuizData = async (req: any, res: any) => {
  try {
    let data = bot_create_quiz_data_ZodSchema.safeParse(req.body);

    if (!data.success) {
      return res.status(403).json({ success: false, message: "invalid data" });
    }
    let Notifystatus = await QuizeSetupFunction(req.bot_user, data.data);

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
    let userid = req.query.user;
    // let response = await prisma.botQuizConfig.findFirst({
    //   where: {
    //     User:
    //   }
    // });
    let data: {} | null = null;

    // let topics = await prisma.bo

    //   data = {
    //     data: response?.rapidtopic || null,
    //     question_count: response?.question_count || null,
    //   };

    return res.json({
      success: true,
      message: " topic sended successfully",
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
};


export const getQuizConfigdData = asyncHandler(async (req: any, res: any) => {
  let { chatid, platform, userid } = req.query;

  // totalQuetions, topics, ismultiple,thread_id ,nextQuestionTime ,quizOpenFor
  let config;
  if (platform === botPlatform.TELEGRAM) {
    config = await prisma.botQuizConfig.findFirst({
      where: {
        chatId: chatid,
      },
      select: {
        total_questions: true,
        topics: true,
        is_multiple_ans: true,
        nextQuestionTime: true,
        quizOpenFor: true,
      },
    });

    if (!config) throw Error("quiz config not found");
  }

  return res.json({ success: true, message: "quiz config ", data: config });
});