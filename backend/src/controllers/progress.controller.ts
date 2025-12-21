import { asyncHandler } from "@/lib/helper/asyncHandler.js";
import { ProgressService } from "../services/progress.service.js";
import { z } from "zod";
import { ZodDataSafeParse } from "@/lib/ZodTypeChecker.js";
import { ProgressStatus } from "@repo/prisma/client.js";

const progressService = new ProgressService();

// Validation Schemas
const trackProgressSchema = z.object({
    topicId: z.string(),
    timeSpentDelta: z.number().min(1), // seconds
});

const updateStatusSchema = z.object({
    topicId: z.string(),
    status: z.nativeEnum(ProgressStatus),
});

export const trackTopicProgress = asyncHandler(async (req: any, res: any) => {
    const validation = trackProgressSchema.safeParse(req.body);
    if (!validation.success) {
        throw ZodDataSafeParse(validation);
    }

    const { topicId, timeSpentDelta } = validation.data;
    // Assuming req.user.id is populated by authentication middleware
    const userId = req.user.id;

    const result = await progressService.trackTopicProgress(userId, topicId, timeSpentDelta);

    res.json({ success: true, message: "Progress tracked", data: result });
});

export const updateTopicStatus = asyncHandler(async (req: any, res: any) => {
    const validation = updateStatusSchema.safeParse(req.body);
    if (!validation.success) {
        throw ZodDataSafeParse(validation);
    }

    const { topicId, status } = validation.data;
    const userId = req.user.id;

    const result = await progressService.updateTopicStatus(userId, topicId, status);

    res.json({ success: true, message: "Status updated", data: result });
});

export const getSyllabusProgress = asyncHandler(async (req: any, res: any) => {
    const { examYearId } = req.params;
    const userId = req.user.id;

    if (!examYearId) {
        return res.status(400).json({ success: false, message: "Exam Year ID is required" });
    }

    const result = await progressService.getSyllabusProgress(userId, examYearId);

    res.json({ success: true, data: result });
});
