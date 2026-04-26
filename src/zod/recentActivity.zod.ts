import { z } from "zod";

export const createActivitySchema = z.object({
    title: z.string().min(1, "Title is required"),
    activityType: z.string().min(1, "Activity type is required"),
    score: z.string().optional(), // Schema says String?
    status: z.string().min(1, "Status is required"),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
