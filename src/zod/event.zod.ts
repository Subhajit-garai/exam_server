import {
  Platform,
  diffcultlevel,
  eventRuns,
  eventType,
  ExamStatus,
  ExamType,
  telegramgroupType,
  UserRole,
  Visibility,
} from "@/db/schema/enums.js";
import { z } from "zod";

const baseEventSchema = z.object({
  isActive: z.boolean().default(false),
  description: z.string(),
  created_by: z.enum(UserRole.enumValues).optional(),
  runs: z.enum(eventRuns.enumValues),
  run_at: z.string(),
  conditions: z.any().optional(),
});

export const exam_create_event_data_schema = z.object({
  starttime: z.array(z.string()),
  count: z.string(),
  title: z.union([z.string(), z.array(z.string())]),
  examname: z.string(),
  category: z.string(),
  Visibility: z.enum(Visibility.enumValues),
  jointime: z.string().optional(),
  duration: z.string().optional(),
  status: z.enum(ExamStatus.enumValues).optional(),
  exam_pattern: z.string(),
  time_limit: z.string(),
  difficulty: z.enum(diffcultlevel.enumValues),
  examtype: z.enum(ExamType.enumValues),
  gap: z.string().optional(),
});

export const quiz_create_event_data_schema = z.object({
  type: z.enum(["quiz"]).default("quiz"),
  bot_user_id: z.string(),
  platform: z.enum(Platform.enumValues),
  chat_type: z.enum(telegramgroupType.enumValues),
  user_id: z.number(),
  chat_id: z.number(),
  thread_id: z.number().optional(),
});

export const createExamEventSchema = baseEventSchema.extend({
  type: z.literal("CREATE_EXAM"),
  payload: exam_create_event_data_schema,
});
export const createQuizEventSchema = baseEventSchema.extend({
  type: z.literal("RUN_NEW_QUIZ"),
  payload: quiz_create_event_data_schema,
});

export const sendMessageEventSchema = baseEventSchema.extend({
  type: z.literal("SEND_MESSAGE"),
  payload: z.object({
    to: z.string(),
    message: z.string(),
  }),
});

export const eventSchema = z.discriminatedUnion("type", [
  sendMessageEventSchema,
  createExamEventSchema,
  createQuizEventSchema,
]);
