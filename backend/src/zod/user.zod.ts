import { ExamType } from "@prisma/client";
import z, { date } from "zod";

export const singupZodSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  telegramid: z.string(),
  password: z.string(),
});

export const singinZodSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
export const useremailValidationZodSchema = z.object({
  email: z.string().email(),
});
export const usertelegramidValidationZodSchema = z.object({
  telegramid: z.string(),
});

export const validateTokenZodSchema = z.object({
  token: z.string(),
  email: z.string().email().optional(),
});

export const forgotpasswordZodSchema = z.object({
  email: z.string().email(),
});
export const forgotpasswordVerifyZodSchema = z.object({
  email: z.string().email(),
  ForgotpasswordToken: z.string(),
  newpassword: z.string(),

});


export const SyllabusInputZodSchema = z.object({
  examname: z.string(),
  category: z.string(),
  topics: z.array(z.string()),
});
export const ExampatternInputZodSchema = z.object({
  title: z.string(),
  format: z.enum(["Text", "Image"]),
  examname: z.string(),
  category: z.string(),
  topics: z.array(z.string()).optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  part: z.boolean(),
  checkbox: z.boolean(),
  part_Count: z.number(),
  total_questions: z.array(z.number()),
  check: z.enum(["Normal", "Hybrid"]), // confush
  marks_values: z.array(z.number()),
  neg_values: z.array(z.number()),
});

export const ExamCreateInputeSchema = z.object({
  name: z.string(),
  examname: z.string(),
  category: z.string(),
  exam_pattern_id: z.string(),
  status: z.enum(["Private", "Public"]),
  starttime:z.string(),
  jointime:z.string().optional(),
  duration: z.string().optional(),
  date: z.string(),
  
});
export const ExamCreateInputeSchema_tyoe_2 = z.object({
  name: z.string(),
  examname: z.string(),
  category: z.string(),
  exam_pattern_id: z.string(),
  status: z.enum(["Private", "Public"]),
  starttime:z.string(),
  jointime:z.string().optional(),
  duration: z.string().optional(),
  date: z.string(),
  mock_questions_set_id: z.string(), // new
  examtype: z.nativeEnum(ExamType) // new
  
});
