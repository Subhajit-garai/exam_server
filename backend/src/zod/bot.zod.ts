import z, { date } from "zod";

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
  type: z.enum(["endpoint","baseurl"]),
  name: z.string().optional(),
  newvalue: z.string(),
});

export const bot_creat_quiz_data_ZodSchema = z.object({
  type: z.enum(["quiz","rapidquiz"]),
  bot_provided_user_id :z.number(),
  bot_provided_chat_id :z.number()
});
