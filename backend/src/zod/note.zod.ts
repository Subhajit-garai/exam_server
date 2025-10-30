import { z } from "zod";

export const createSubject_schema = z.object({
  name: z.string().min(1, { message: "Name cannot be empty" }),
  shortName: z.string().min(1, { message: "shortName cannot be empty" }),
  description: z.string().min(1, { message: "description cannot be empty" }),
  slug: z.string().min(1, { message: "slug cannot be empty" }),
  category: z.string().min(1, { message: "category cannot be empty" }),
  order: z.number(),

  iconUrl: z.string().optional(),
  color: z.string().optional(),
  isPublic: z.boolean().default(false),
  level: z.string().optional(),
  difficulty: z.number().optional(),
});
export const createTopic_schema = z.object({
  subjectId: z.string().min(1, { message: "subjectId cannot be empty" }),
  name: z.string().min(1, { message: "Name cannot be empty" }),
  shortName: z.string().min(1, { message: "shortName cannot be empty" }),
  description: z.string().min(1, { message: "description cannot be empty" }),
  slug: z.string().min(1, { message: "slug cannot be empty" }),
  order: z.number(),


  isparentTopic: z.boolean().optional(),
  parentTopicId: z.string().optional(),
  iconUrl: z.string().optional(),
  color: z.string().optional(),
  isPublic: z.boolean().optional(),
  // category: z.string().optional(),
  level: z.string().optional(),
  difficulty: z.number().optional(),
});

export const noteUpdate_schema = z.object({
  topicid: z.string(),
  content: z.string(),
});
