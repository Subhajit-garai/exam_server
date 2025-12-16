import { diffcultlevel, examformat, Status } from "@repo/prisma/client.js"
import z from "zod";


export type questionInput_type = z.infer<typeof questionInputZodSchema>;

export const questionInputZodSchema = z.object({
  title: z.string().min(1, "question title is required"),
  examname: z.string(),
  explanation: z.string(),
  options: z.array(z.string()),
  ans: z.array(z.string()),
  isMultiple: z.boolean().default(false),
  category: z.string(),
  topic: z.string().min(1, "topic name is required"),
  subject: z.string().min(1, "subject name is required"),
  history: z.array(z.string()).optional().default([""]), // new
  links: z
    .string()
    .transform((val) => val.split(",").map((s) => s.trim()))
    .optional(),
  difficulty: z.nativeEnum(diffcultlevel),
  format: z.nativeEnum(examformat),
  status: z.nativeEnum(Status),
  extra: z
    .object({
      Code: z.string().optional(),
      other: z.string().optional(),
    })
    .optional()
    .default({}),
});


export const questionUpdateZodSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  options: z.array(z.string()).optional(),
  extra: z
    .object({
      Code: z.string().optional(),
      Img: z.string().optional(),
      Text: z.string().optional(),
      other: z.string().optional(),
    })
    .nullable()
    .optional(),
  ans: z.array(z.string()).optional(),
  format: z.nativeEnum(examformat).optional(),
  category: z.string().optional(),

  // Relations (optional updates)
  topic_id: z.string().optional(),
  subject_id: z.string().optional(),

  // Old fields (optional updates)
  old_topic: z.string().optional(),
  old_sub_topic: z.string().optional(),

  history: z.array(z.string()).optional(),
  explanation: z.string().optional(),
  links: z.array(z.string()).optional(),
  is_multiple_ans: z.boolean().optional(),
  created_by: z.string().optional(),
  difficulty: z.nativeEnum(diffcultlevel).optional(),
  status: z.nativeEnum(Status).optional(),
  weight: z.number().optional(),
});

export const QuestionFilterDataFetchZodSchema = z.object({
  id: z.string().optional(),
  page: z.string().optional(),
  title: z.string().optional(),
  links: z.string().optional(),
  history: z.string().optional(),
  difficulty: z.nativeEnum(diffcultlevel).optional(),
  format: z.nativeEnum(examformat).optional(), // Fixed typo from formate
  status: z.nativeEnum(Status).optional(),
  ismultipleans: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  // New filters
  subject: z.string().optional(),
  topic: z.string().optional(),
  categoryid: z.string().optional(),
  created_by: z.string().optional(),
});

export const SubmitedQuestionAnsZodSchema = z.object({
  examid: z.string(),
  ans: z.string(),
  part: z.string(),
  number: z.string(),
  ismultiple: z.preprocess((val) => {
    if (typeof val === "string") {
      return val === "true";
    }
    return val;
  }, z.boolean()),
});

// mock question set type

export const mockQuestionSetZodSchema = z.object({
  name: z.string(),
  exam: z.string(),
  category: z.string(),
  description: z.string(),
  pattern: z.string().optional(),
  questions: z.record(z.string(), z.array(z.string())).optional(),
});
export const mockQuestionAddZodSchema = z.object({
  id: z.string(),
  part: z.string(),
  questionid: z.string(),
});
