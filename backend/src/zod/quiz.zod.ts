import { CreationTypes, ExamStage, ExamStatus, quiz_type } from  "@repo/prisma/client"
import z, { date } from "zod";


export const create_quiz_data_ZodSchema = z.object({
  is_need_registration: z.boolean().default(false),
  name: z.string().optional(),
  category: z.string(),
  topics: z.array(z.string()),
  created_by: z.string().optional(),
  status: z.nativeEnum(ExamStatus),
  creationstatus: z.nativeEnum(CreationTypes),
  starttime: z.string().optional(),
  endtime: z.string().optional(),
  nextQuestionTime: z.number().optional(),
  quizOpenFor: z.number().optional(),
  question_count: z.number().optional(),
  quiz_type: z.nativeEnum(quiz_type),
  chatId: z.string().optional(),
  stage: z.nativeEnum(ExamStage),

});

export type createQuizType = z.infer< typeof create_quiz_data_ZodSchema>