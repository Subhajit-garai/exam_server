


import { diffcultlevel, eventRuns, ExamStatus, ExamType, UserRole } from "@prisma/client";
import { z } from "zod";

const sendMessageEventSchema = z.object({
  type: z.literal("SEND_MESSAGE"),
  data: z.object({
    to: z.string(),
    message: z.string(),
  }),
  description: z.string(),
  created_by: z.nativeEnum(UserRole),
  runs: z.nativeEnum(eventRuns),
  run_at: z.string(),
  conditions: z.any(), // for now
});

const createExamEventSchema = z.object({
  type: z.literal("CREATE_EXAM"),
  data: z.object({
    time: z.array(z.string()),
    count: z.number(),
    name: z.union([z.string(), z.array(z.string())]),
    examname: z.string(),
    category: z.string(),
    jointime: z.string().optional(),
    duration: z.string().optional(),
    status: z.nativeEnum(ExamStatus),
    exam_pattern: z.string(),
    time_limit: z.string(),
    difficulty: z.nativeEnum(diffcultlevel),
    examType: z.nativeEnum(ExamType),
  }),
  description: z.string(),
  created_by: z.nativeEnum(UserRole),
  runs: z.nativeEnum(eventRuns),
  run_at: z.string(),
  conditions: z.any(), // for now
});

export const eventSchema = z.discriminatedUnion("type", [
  sendMessageEventSchema,
  createExamEventSchema,
]);
