import { SyllabusType } from "@repo/packages/prisma";
import z, { date } from "zod";

export const SyllabusInputZodSchema = z.object({
  title: z.string(),
  exam_year_id: z.string().optional(), // here it can be for quiz
  description: z.string().optional(),
  type: z.nativeEnum(SyllabusType)

});
export const AddSubjectInputZodSchema = z.object({
  syllabusId: z.string(),
  subject_id: z.string(),
  weightage: z.number().optional(), 
});
export const AddTopicInputZodSchema = z.object({
  subject_id: z.string(), // here  it converted into subject_map_id via syllabus id 
  topic_id: z.string(), 
  syllabusId: z.string(),
  weightage: z.number().optional(), 
});


