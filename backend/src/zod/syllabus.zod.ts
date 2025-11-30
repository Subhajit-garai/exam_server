import { SyllabusType } from "@repo/prisma/client.js";
import z, { date } from "zod";

export const SyllabusInputZodSchema = z.object({
  title: z.string(),
  exam_year_id: z.string(), // here it can be for quiz
  description: z.string().optional(),
  type: z.nativeEnum(SyllabusType)

});

export const AddTopicInputZodSchemaById = z.object({
  subject_id: z.string(), // here  it converted into subject_map_id via syllabus id 
  topic_id: z.string(),
  syllabusId: z.string(),
  weightage: z.number().optional(),
});
export const AddTopicInputZodSchemaByName = z.object({
  subject_id: z.string(), // here  it converted into subject_map_id via syllabus id 
  name: z.string(),
  syllabusId: z.string(),
  weightage: z.number().optional(),
});
export const AddTopicInputZodSchemaByShortName = z.object({
  subject_id: z.string(), // here  it converted into subject_map_id via syllabus id 
  shortName: z.string(),
  syllabusId: z.string(),
  weightage: z.number().optional(),
});

export const AddSubjectInputZodSchemaById = z.object({
  syllabusId: z.string(),
  subject_id: z.string(),
  weightage: z.number().optional(),
});
export const AddSubjectInputZodSchemaByName = z.object({
  syllabusId: z.string(),
  name: z.string(),
  weightage: z.number().optional(),
});
export const AddSubjectInputZodSchemaByShortName = z.object({
  syllabusId: z.string(),
  shortName: z.string(),
  weightage: z.number().optional(),
});


