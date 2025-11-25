import {
  botPlatform,
  diffcultlevel,
  eventRuns,
  eventType,
  ExamStatus,
  ExamType,
  telegramgroupType,
  UserRole,
  Visibility,
} from "@repo/prisma/client";
import { z } from "zod";

const baseEventSchema = z.object({
  isActive: z.boolean().default(false),
  description: z.string(),
  created_by: z.nativeEnum(UserRole).optional(),
  runs: z.nativeEnum(eventRuns),
  run_at: z.string(),
  conditions: z.any().optional(),
});

export const exam_create_event_data_schema = z.object({
  starttime: z.array(z.string()),
  count: z.string(),
  title: z.union([z.string(), z.array(z.string())]),
  examname: z.string(),
  category: z.string(),
  Visibility: z.nativeEnum(Visibility),
  jointime: z.string().optional(),
  duration: z.string().optional(),
  status: z.nativeEnum(ExamStatus).optional(),
  exam_pattern: z.string(),
  time_limit: z.string(),
  difficulty: z.nativeEnum(diffcultlevel),
  examtype: z.nativeEnum(ExamType),
});

export const quiz_create_event_data_schema = z.object({
  type: z.enum(["quiz"]).default("quiz"),
  bot_user_id: z.string(),
  platform: z.nativeEnum(botPlatform),
  chat_type: z.nativeEnum(telegramgroupType),
  user_id: z.number(),
  chat_id: z.number(),
  thread_id: z.number().optional(),
});

export const createExamEventSchema = baseEventSchema.extend({
  type: z.literal(eventType.CREATE_EXAM),
  payload: exam_create_event_data_schema,
});
export const createQuizEventSchema = baseEventSchema.extend({
  type: z.literal(eventType.RUN_NEW_QUIZ),
  payload: quiz_create_event_data_schema,
});

export const sendMessageEventSchema = baseEventSchema.extend({
  type: z.literal(eventType.SEND_MESSAGE),
  payload: z.object({
    to: z.string(),
    message: z.string(),
  }),
});

export const eventSchema = z.discriminatedUnion("type", [
  sendMessageEventSchema,
  createExamEventSchema,
]);
