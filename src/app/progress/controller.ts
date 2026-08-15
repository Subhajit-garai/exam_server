import { asyncHandler } from "@/utils/asyncHandler.js";
import { ProgressService } from "./service.js";
import { z } from "zod";
import { ZodDataSafeParse } from "@/utils/ZodTypeChecker.js";
import { ProgressStatus } from "@/db/enums.js";
import { CustomError } from "@/middleware/globalErrorHandler.js";

const progressService = new ProgressService();

// Validation Schemas
const trackProgressSchema = z.object({
  topicName: z.string(),
  timeSpentDelta: z.number().min(1), // seconds
});

const updateStatusSchema = z.object({
  topicName: z.string(),
  status: z.enum(ProgressStatus.enumValues),
});

export const trackTopicProgress = asyncHandler(async (req: any, res: any) => {
  const validation = trackProgressSchema.safeParse(req.body);
  if (!validation.success) {
    throw ZodDataSafeParse(validation);
  }

  const { topicName, timeSpentDelta } = validation.data;
  const userId = req.user;

  const result = await progressService.trackTopicProgress(
    userId,
    topicName,
    timeSpentDelta,
  );

  res.json({ success: true, message: "Progress tracked", data: result });
});

export const updateTopicStatus = asyncHandler(async (req: any, res: any) => {
  const validation = updateStatusSchema.safeParse(req.body);
  if (!validation.success) {
    throw ZodDataSafeParse(validation);
  }

  const { topicName, status } = validation.data;
  const userId = req.user;

  const result = await progressService.updateTopicStatus(
    userId,
    topicName,
    status,
  );

  res.json({ success: true, message: "Status updated", data: result });
});

export const getSyllabusProgress = asyncHandler(async (req: any, res: any) => {
  const { examYearId } = req.params;
  const userId = req.user;

  if (!examYearId) {
    throw new CustomError("Exam Year ID is required", 400);
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

export const getUserTopicsProgress = asyncHandler(
  async (req: any, res: any) => {
    const userId = req.user;
    const result = await progressService.getUserTopicsProgress(userId);
    res.json({ success: true, data: result });
  },
);
