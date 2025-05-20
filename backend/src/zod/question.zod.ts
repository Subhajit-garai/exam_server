import { diffcultlevel, examformate, Status } from "@prisma/client";
import z, { date } from "zod";

export const questionInputZodSchema = z.object({
  Title: z.string(),
  Explanation: z.string(),
  options: z.array(z.string()),
  ans: z.array(z.string()),
  category: z.string(),
  topic: z.string(),
  difficulty: z.nativeEnum(diffcultlevel),
  formate: z.nativeEnum(examformate),
  status: z.nativeEnum(Status),
  extra: z
    .object({
      code: z.string().optional(),
      other: z.string().optional(),
    })
    .optional(),
});
export const questionUpdateZodSchema = z.object({
  id: z.string(),
  title: z.string(),
  options: z.array(z.string()),
  extra: z
    .object({
      code: z.string().optional(),
      other: z.string().optional(),
    })
    .optional(),
  ans: z.array(z.string()),
  formate: z.nativeEnum(examformate),
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

export const QuestionProssingDataFetchZodSchema = z.object({
  id: z.string().optional(),
  category: z.string().optional(),
  topic: z.string().optional(),
  difficulty: z.nativeEnum(diffcultlevel).optional(),
  formate: z.nativeEnum(examformate).optional(),
  status: z.nativeEnum(Status).optional(),
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
