import { asyncHandler } from "@/lib/helper/asyncHandler.js";
import { ProgressService } from "../services/progress.service.js";
import { z } from "zod";
import { ZodDataSafeParse } from "@/lib/ZodTypeChecker.js";
import { ProgressStatus } from "@repo/prisma/client.js";

const progressService = new ProgressService();

// Validation Schemas
const trackProgressSchema = z.object({
    topicName: z.string(),
    timeSpentDelta: z.number().min(1), // seconds
});

const updateStatusSchema = z.object({
    topicName: z.string(),
    status: z.nativeEnum(ProgressStatus),
});

export const trackTopicProgress = asyncHandler(async (req: any, res: any) => {
    const validation = trackProgressSchema.safeParse(req.body);
    if (!validation.success) {
        throw ZodDataSafeParse(validation);
    }

    const { topicName, timeSpentDelta } = validation.data;
    // Assuming req.user.id is populated by authentication middleware
    const userId = req.user;

    const result = await progressService.trackTopicProgress(userId, topicName, timeSpentDelta);

    res.json({ success: true, message: "Progress tracked", data: result });
});

export const updateTopicStatus = asyncHandler(async (req: any, res: any) => {
    const validation = updateStatusSchema.safeParse(req.body);
    if (!validation.success) {
        throw ZodDataSafeParse(validation);
    }

    const { topicName, status } = validation.data;
    const userId = req.user;

    const result = await progressService.updateTopicStatus(userId, topicName, status);

    res.json({ success: true, message: "Status updated", data: result });
});

export const getSyllabusProgress = asyncHandler(async (req: any, res: any) => {
    const { examYearId } = req.params;
    const userId = req.user;

    if (!examYearId) {
        return res.status(400).json({ success: false, message: "Exam Year ID is required" });
    }

    const result = await progressService.getSyllabusProgress(userId, examYearId);

    res.json({ success: true, data: result });
});


export const getDashboardStats = asyncHandler(async (req: any, res: any) => {
    const userId = req.user;
    const result = await progressService.getDashboardStats(userId);
    res.json({ success: true, data: result });
});

export const getStudyHours = asyncHandler(async (req: any, res: any) => {
    const result = await progressService.getStudyHours(req.user);
    res.json({ success: true, data: result });
});

export const getTestsAttempted = asyncHandler(async (req: any, res: any) => {
    const result = await progressService.getTestsAttempted(req.user);
    res.json({ success: true, data: result });
});

export const getAvgScore = asyncHandler(async (req: any, res: any) => {
    const result = await progressService.getAverageScore(req.user);
    res.json({ success: true, data: result });
});

export const getAccuracy = asyncHandler(async (req: any, res: any) => {
    const result = await progressService.getAccuracy(req.user);
    res.json({ success: true, data: result });
});
