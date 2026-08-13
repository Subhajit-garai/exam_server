import { SyllabusType } from "@/db/schema/enums.js";
import z from "zod";

export const SyllabusInputZodSchema = z.object({
  title: z.string(),
  exam_year_id: z.string(), // here it can be for quiz
  description: z.string().optional(),
  type: z.enum(SyllabusType.enumValues),
});

export const AddTopicInputZodSchemaById = z.object({
  subject_id: z.string(), // here  it converted into subject_map_id via syllabus id
  topic_id: z.string(),
  syllabus_id: z.string(),
  weightage: z.number().optional(),
});
export const AddTopicInputZodSchemaByName = z.object({
  subject_id: z.string(), // here  it converted into subject_map_id via syllabus id
  name: z.string(),
  syllabus_id: z.string(),
  weightage: z.number().optional(),
});
export const AddTopicInputZodSchemaByShortName = z.object({
  subject_id: z.string(), // here  it converted into subject_map_id via syllabus id
  shortName: z.string(),
  syllabus_id: z.string(),
  weightage: z.number().optional(),
});

export const AddSubjectInputZodSchemaById = z.object({
  syllabus_id: z.string(),
  subject_id: z.string(),
  weightage: z.number().optional(),
});
export const AddSubjectInputZodSchemaByName = z.object({
  syllabus_id: z.string(),
  name: z.string(),
  weightage: z.number().optional(),
});
export const AddSubjectInputZodSchemaByShortName = z.object({
  syllabus_id: z.string(),
  shortName: z.string(),
  weightage: z.number().optional(),
});
