import { webhook_type } from "../types/botTypes";
import { z } from "zod";
import prisma, { Prisma } from "@repo/db/index";
import { examManager } from "../manager/examManager";
import { bot_create_quiz_data_ZodSchema } from "../../zod/bot.zod";
const em = examManager.getInstance();

type BotCreateQuizData = z.infer<typeof bot_create_quiz_data_ZodSchema>;

type QuizConfigData = Awaited<
  ReturnType<typeof prisma.botQuizConfig.findFirst>
>;

export const QuizeSetupFunction = async (
  bot_user: string,
  data: BotCreateQuizData
) => {
  let {
    bot_provided_user_id,
    bot_provided_chat_id,
    type = "quiz",
    platform,
    chat_type,
  } = data;

  let bot_webhook = await prisma.botInfo.findFirst({
    where: {
      botuser_id: bot_user,
    },
  });
  if (!bot_webhook) {
    console.log("No bot webhook found");
  }

  let webhook: webhook_type = bot_webhook?.webhook as webhook_type;
  let cbUrl = `${webhook.baseurl}${webhook.endpoint.survertask}`;

  let Notifystatus = await em.getredisclient().push({
    type: "CREATE_EXAM",
    id: String(bot_provided_chat_id),
    payload: {
      cburl: cbUrl,
      userid: bot_provided_user_id,
      chatid: bot_provided_chat_id,
      platfrom: platform,
      chat_type: chat_type,
    },
    variant:"Quiz",
    category:"JECA"
  });

  return Notifystatus;
};
