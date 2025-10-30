import { diffcultlevel, examformat, Status } from  "@repo/packages/prisma"
import z, { date, nullable } from "zod";

export const questionInputZodSchema = z.object({
  Title: z.string(),
  examname: z.string(),
  Explanation: z.string(),
  options: z.array(z.string()),
  ans: z.array(z.string()),
  isMultiple: z.boolean().default(false),
  category: z.string(),
  topic_id: z.string(),
  subject_id: z.string(),
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
  title: z.string(),
  options: z.array(z.string()),
  extra: z
    .object({
      Code: z.string().optional(),
      Img: z.string().optional(),
      Text: z.string().optional(),
      other: z.string().optional(),
    })
    .nullable()
    .optional(),
  ans: z.array(z.string()),
  formate: z.nativeEnum(examformat),
  category: z.string(),
  sub_topic: z.string(),
  history: z.array(z.string()),
  topic: z.string(),
  explanation: z.string(),
  links: z.array(z.string()),
  is_multiple_ans: z.boolean(),
  created_by: z.string(),
  difficulty: z.nativeEnum(diffcultlevel),
  status: z.nativeEnum(Status),
  weight: z.number(),
});

export const QuestionFilterDataFetchZodSchema = z.object({
  id: z.string().optional(),
  page: z.string().optional(),
  title: z.string().optional(),
  sub_topic: z.string().optional(),
  category: z.string().optional(),
  links: z.string().optional(),
  history: z.string().optional(),
  topic: z.string().optional(),
  difficulty: z.nativeEnum(diffcultlevel).optional(),
  formate: z.nativeEnum(examformat).optional(),
  status: z.nativeEnum(Status).optional(),
  ismultipleans: z
    .string()
    .transform((val) => val === "true")
    .optional(),
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
