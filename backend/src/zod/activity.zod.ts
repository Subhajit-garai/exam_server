import { ActivityType } from "@repo/prisma/enums.js";
import { z } from "zod";

export const CompleteActivitySchema = z.object({
    userId: z.string(),
    activityType: z.nativeEnum(ActivityType),
    xpEarned: z.number().min(0),
    metadata: z.record(z.any()).optional(), // For storing extra info like quizId, score, etc.
});

export type CompleteActivityInput = z.infer<typeof CompleteActivitySchema>;

export const createActivitySchema = z.object({
    title: z.string().min(1, "Title is required"),
    type: z.nativeEnum(ActivityType),
    score: z.string().optional(),
    status: z.string().min(1, "Status is required"),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
