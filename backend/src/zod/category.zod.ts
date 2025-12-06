import { z } from "zod";

export const createCategorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required").optional(), // Optional if generated on backend
    shortName: z.string().optional(),
    description: z.string().optional(),
    iconUrl: z.string().url().optional().or(z.literal("")),
});

export const updateCategorySchema = z.object({
    id: z.string().min(1, "ID is required"),
    name: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    shortName: z.string().optional(),
    description: z.string().optional(),
    iconUrl: z.string().url().optional().or(z.literal("")),
});
