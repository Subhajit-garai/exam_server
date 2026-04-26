import { ExamScope, ExamStatus, ExamType } from "@repo/db/schema/enums.js";
import { z } from "zod";

export const create_targated_exam_zodSchemea = z.object({
  name: z.string(),
  shortCode: z.string(),
  description: z.string(),
  isPublic: z.boolean().default(false),
  category: z.string().optional(),
  examScope: z.enum(ExamScope.enumValues),
});
export const create_targated_exam_year_zodSchemea = z.object({
  targetExamId: z.string(),
  year: z.string(),
  status: z.enum(ExamStatus.enumValues).default("SCHEDULED"),
  isPublic: z.boolean().default(false),
  isDeleted: z.boolean().default(false),
  slug: z.string().optional(),
  registrationOpenDate: z.coerce.date().optional(),
  registrationCloseDate: z.coerce.date().optional(), // coerce -->  conver number and string in to date
  examDate: z.coerce.date().optional(),
  resultDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});
export const updare_targated_exam_year_zodSchemea = z.object({
  exam_year_id: z.string(),
  slug: z.string().optional(),
  status: z.enum(ExamStatus.enumValues).optional(),
  registrationOpenDate: z.coerce.date().optional(),
  registrationCloseDate: z.coerce.date().optional(),
  examStartDate: z.coerce.date().optional(),
  examEndDate: z.coerce.date().optional(),
  resultDate: z.coerce.date().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
});
