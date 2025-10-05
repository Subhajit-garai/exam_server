import { ExamScope, ExamStatus, ExamType } from "@prisma/client";
import { z } from "zod";

export const create_targated_exam_zodSchemea = z.object({
  name: z.string(),
  shortCode: z.string(),
  description: z.string(),
  category: z.string().optional(),
  examScope: z.nativeEnum(ExamScope),
});
export const create_targated_exam_year_zodSchemea = z.object({
  targetExamId: z.string(),
  year: z.number(),
  slug: z.string(),
  status:z.nativeEnum(ExamStatus),
  registrationOpenDate: z.coerce.date().optional(),
  registrationCloseDate: z.coerce.date().optional(),  // coerce -->  conver number and string in to date
  examStartDate: z.coerce.date().optional(),
  examEndDate: z.coerce.date().optional(),
  resultDate: z.coerce.date().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
});
export const updare_targated_exam_year_zodSchemea = z.object({
  exam_year_id: z.string() ,
  slug: z.string().optional(),
  status:z.nativeEnum(ExamStatus).optional(),
  registrationOpenDate: z.coerce.date().optional(),
  registrationCloseDate: z.coerce.date().optional(),
  examStartDate: z.coerce.date().optional(),
  examEndDate: z.coerce.date().optional(),
  resultDate: z.coerce.date().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
});




