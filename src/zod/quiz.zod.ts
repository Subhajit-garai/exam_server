import {
  CreationTypes,
  ExamStage,
  ExamStatus,
  quiz_type,
} from "@/db/schema/enums.js";
import z from "zod";

export const create_quiz_data_ZodSchema = z.object({
  is_need_registration: z.boolean().default(false),
  name: z.string().optional(),
  category: z.string(),
  topics: z.array(z.string()),
  created_by: z.string().optional(),
  status: z.enum(ExamStatus.enumValues),
  creationstatus: z.enum(CreationTypes.enumValues),
  starttime: z.string().optional(),
  endtime: z.string().optional(),
  nextQuestionTime: z.number().optional(),
  ttl: z.number().optional(),
  question_count: z.number().optional(),
  quiz_type: z.enum(quiz_type.enumValues),
  chatId: z.string().optional(),
  stage: z.enum(ExamStage.enumValues),
});

export const activity_quiz_create_data_ZodSchema = z.object({
  total_questions: z.string().optional(),
  nextQuestionTime: z.string().optional(),
  ttl: z.string().optional(),
  topic: z.string(),
  subject: z.string(),
  mode: z.string(),
});

export type activity_quiz_create_data_type = z.infer<
  typeof activity_quiz_create_data_ZodSchema
>;
export type createQuizType = z.infer<typeof create_quiz_data_ZodSchema>;
