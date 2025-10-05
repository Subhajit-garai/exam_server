import { webhook_type } from "../types/botTypes";
import { z } from "zod";
import prisma from "../../db";
import { examManager } from "../examManager";
import { bot_create_quiz_data_ZodSchema } from "../../src/zod/bot.zod";
const em = examManager.getInstance();

type BotCreateQuizData = z.infer<typeof bot_create_quiz_data_ZodSchema>;

type QuizConfigData = {
  id: string;
  created_at: Date;
  chatId: string | null;
  quiztopic: string[];
  rapidtopic: string[];
  exam: string;
  nextQuestionTime: number;
  quizOpenFor: number;
  question_count: string;
  created_by: string | null;
} | null;

export const QuizeSetupFunction = async (
  user: string,
  data: BotCreateQuizData
) => {
  let {
    bot_provided_user_id,
    bot_provided_chat_id,
    type = "quiz",
    chat_type,
  } = data;

  let totalQuetions: number = 0;
  let quizTopics: string[] = [];
  let bot_user = user;
  let thread_id: number | undefined = undefined;

  let quiz_config_data: QuizConfigData = null;

  // is group is accessed

  switch (chat_type) {
    case "private":
      console.log("private chat");

      let userData = await prisma.user.findFirst({
        where: {
          telegram: {
            telegramid: String(bot_provided_user_id),
          },
        },
      });

      if (!userData) {
        throw new Error(`No user data found ,${bot_provided_user_id}`);
      }

      quiz_config_data = await prisma.botQuizConfig.findFirst({
        where: {
          chatId: userData?.id,
        },
      });

      if (!quiz_config_data) {
        throw new Error(
          `No quiz config data found for given user ,${bot_provided_user_id}`
        );
      }

      break;

    case "channel":
      console.log("channel chat");

      break;
    case "supergroup":
      {
        console.log("supergroup chat");

        let groupData = await prisma.telegramGroupInfo.findFirst({
          where: {
            groupid: String(bot_provided_chat_id),
            isBanned: false,
          },
        });

        if (!groupData) {
          throw new Error(
            `No group data found or it may be banned",${bot_provided_chat_id}`
          );
        }

        quiz_config_data = await prisma.botQuizConfig.findFirst({
          where: {
            chatId: groupData?.id,
          },
        });

        if (groupData.isTopic) {
          let topicData = await prisma.telegramGroupTopic.findFirst({
            where: {
              groupId: groupData.id,
              name: "quiz",
            },
          });

          if (!topicData) {
            throw new Error(
              `No topic data found or it not added,${bot_provided_chat_id}`
            );
          }

          thread_id = topicData?.topicId;
          console.log("therad id is avalible and thread id is --> ", thread_id);
        }
      }

      break;
    case "group": {
      console.log("group chat");

      let groupData = await prisma.telegramGroupInfo.findFirst({
        where: {
          groupid: String(bot_provided_chat_id),
          isBanned: false,
        },
      });

      if (!groupData) {
        throw new Error(
          `No group data found or it may be banned",${bot_provided_chat_id}`
        );
      }

      quiz_config_data = await prisma.botQuizConfig.findFirst({
        where: {
          chatId: groupData?.id,
        },
      });

      break;
    }
    default:
      console.log("undefined chat "); // gr
      console.log("undefined chat type", chat_type);

      break;
  }

  if (!quiz_config_data) {
    // throw new Error("No quiz topic found");
    return console.log("quiz config error", quiz_config_data);
  }

  if (type) {
    switch (type) {
      case "rapidquiz":
        {
          console.log("rapidquiz");
          quizTopics = quiz_config_data?.rapidtopic;
          totalQuetions = parseInt(quiz_config_data?.question_count);
        }
        break;

      default:
        {
          console.log("quiz");
          quizTopics = quiz_config_data?.quiztopic;
          totalQuetions = 1;
        }
        break;
    }
  }
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
    //id :
    type: "createQuiz",
    cburl: cbUrl,
    totalQuetions: totalQuetions,
    thread_id: thread_id,
    topics: quizTopics,
    userid: bot_provided_user_id,
    chatid: bot_provided_chat_id,
    nextQuestionTime: quiz_config_data.nextQuestionTime,
    quizOpenFor: quiz_config_data.quizOpenFor,
  });

  return Notifystatus;
};
