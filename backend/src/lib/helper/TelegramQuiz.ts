import { webhook_type } from "../types/botTypes.js";
import { z } from "zod";
import prisma, { Prisma } from "@repo/db/index.js";
import { ExamManager } from "../manager/examManager.js";
import { bot_create_quiz_data_ZodSchema } from "../../zod/bot.zod.js";
import { logger } from "./logger.js";
const em = ExamManager.getInstance();

type BotCreateQuizData = z.infer<typeof bot_create_quiz_data_ZodSchema>;

type QuizConfigData = Awaited<
  ReturnType<typeof prisma.botQuizConfig.findFirst>
>;

export const QuizeSetupFunction = async (
  bot_user: string,
  data: BotCreateQuizData
) => {
  let {
    user_id,
    chat_id,
    type = "quiz",
    platform,
    chat_type,
  } = data;


  logger.info("bot user info ", bot_user);
  logger.info(" telegram   chat   info ", chat_type);


  let bot_webhook = await prisma.botInfo.findFirst({
    where: {
      botuser_id: bot_user,
    },
  });
  if (!bot_webhook) {
    logger.error("No bot webhook found");
    // notify admin bot need to update its cburl
    return false;
  }
  let webhook: webhook_type = bot_webhook?.webhook as webhook_type;
  let cbUrl = `${webhook.baseurl}${webhook.endpoint.survertask}`;
  let Notifystatus = await em.getRedisClient().push({
    type: "SEND_QUIZ_DATA",
    id: String(chat_id),
    payload: {
      cburl: cbUrl,
      userid: user_id,
      chatid: chat_id,
      platfrom: platform,
      chat_type: chat_type,
    },
    variant: "Quiz",
    category: "JECA"
  });

  return Notifystatus;
};
