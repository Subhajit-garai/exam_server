import z, { date } from "zod";

export const questionInputZodSchema = z.object({
  Title: z.string(),
  Explanation: z.string(),
  options: z.array(z.string()),
  ans: z.array(z.string()),
  category: z.string(),
  topic: z.string(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  formate: z.enum(["Text", "Image"]),
});

export const QuestionProssingDataFetchZodSchema = z.object({
  id: z.string().optional(),
  category: z.string().optional(),
  topic: z.string().optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  formate: z.enum(["Text", "Image"]).optional(),
  status: z.enum(["Processing", "Done", "Duplicate", "Suspended"]).optional(),
});


