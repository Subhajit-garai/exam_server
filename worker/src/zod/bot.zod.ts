import { Platform, telegramgroupType } from "@repo/prisma/client.js";
import z from "zod";

export const bot_singupZodSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  telegramid: z.string(),
  password: z.string(),
  bottoken: z.string(),
});
export const bot_singinZodSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
export const update_botwebhook_ZodSchema = z.object({
  bot_userid: z.string(),
  type: z.enum(["endpoint", "baseurl"]),
  name: z.string().optional(),
  newvalue: z.string(),
});

export const bot_create_quiz_data_ZodSchema = z.object({
  type: z.enum(["quiz"]),
  chat_type: z.nativeEnum(telegramgroupType),
  platform: z.nativeEnum(Platform).default("NONE"),
  user_id: z.number(),
  chat_id: z.number(),
});


export const unbanuser_notification_zod_type = z.object({
  user_id: z.string(),
  chat_id: z.string(),
});
export const banuser_notification_zod_type = z.object({
  user_id: z.string(),
  chat_id: z.string(),
  ban_from_type: z.string(),
});

export const createBotQuizConfigSchema = z.object({
  title: z.string().optional(),
  chatId: z.string().optional(),
  platform: z.nativeEnum(Platform).default(Platform.NONE),
  syllabusid: z.string().optional(),
  topics: z.array(z.string()).optional(),
  exam: z.string().optional(),
  nextQuestionTime: z.number().default(40).optional(),
  quizOpenFor: z.number().default(60).optional(),
  variableDelay: z.boolean().default(false).optional(),
  suffleQuestions: z.boolean().default(true).optional(),
  total_questions: z.number().default(0).optional(),
  marks_values: z.number().default(1).optional(),
  neg_values: z.number().default(0).optional(),
  is_multiple_ans: z.boolean().default(false).optional(),
  waiting_time: z.number().default(10).optional(),
});

export const updateBotQuizConfigSchema = createBotQuizConfigSchema.partial();
