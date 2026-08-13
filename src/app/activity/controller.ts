import { Request, Response } from "express";
import {
  ActivityService,
  activity_time_range,
} from "./service.js";
import {
  CompleteActivitySchema,
  createActivitySchema,
} from "../../zod/activity.zod.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { CustomError } from "@/middleware/globalErrorHandler.js";

const activityService = new ActivityService();

export const getDailyChallenge = asyncHandler(
  async (req: Request, res: Response) => {
    const challenge = await activityService.getDailyChallenge();
    res.status(200).json({
      success: true,
      data: challenge,
      message: "Daily challenge fetched successfully",
    });
  },
);

export const getDailyChallengeHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const challenge = await activityService.getDailyChallengeHistory();
    res.status(200).json({
      success: true,
      data: challenge,
      message: "Daily challenge history fetched successfully",
    });
  },
);

export const completeDailyChallenge = asyncHandler(
  async (req: Request, res: Response) => {
    const validation = CompleteActivitySchema.safeParse(req.body);
    if (!validation.success) {
      throw new CustomError("Invalid input", 400);
    }

    const result = await activityService.completeActivity(validation.data);
    res.status(200).json({
      success: true,
      data: result,
      message: "Activity completed successfully",
    });
  },
);

export const getUserStats = asyncHandler(async (req: any, res: Response) => {
  const userId = req.user;
  if (!userId) {
    throw new CustomError("User ID is required", 400);
  }

  const stats = await activityService.getUserStats(userId);
  res.status(200).json({
    success: true,
    data: stats,
    message: "User stats fetched successfully",
  });
});

export const logActivity = asyncHandler(async (req: any, res: Response) => {
  const userId = req.user;
  if (!userId) {
    throw new CustomError("Unauthorized", 401);
  }

  const validation = createActivitySchema.safeParse(req.body);
  if (!validation.success) {
    throw new CustomError("Invalid input", 400);
  }

  const result = await activityService.createActivity(userId, validation.data);
  res.status(201).json({
    success: true,
    data: result,
    message: "Activity created successfully",
  });
});

export const getRecentActivities = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).user;
    if (!userId) {
      throw new CustomError("Unauthorized", 401);
    }

    const activities = await activityService.getRecentActivities(userId);

    const formattedActivities = activities.map((activity) => ({
      title: activity.title,
      score: activity.score,
      status: activity.status,
      date: activity.completedAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      activityType: activity.activityType,
    }));

    res.status(200).json({
      success: true,
      data: formattedActivities,
      message: "Recent activities fetched successfully",
    });
  },
);

export const getUserRewards = asyncHandler(async (req: any, res: Response) => {
  const userId = req.user;
  if (!userId) {
    throw new CustomError("Unauthorized", 401);
  }

  const rewards = await activityService.getUserRewards(userId);
  res.status(200).json({
    success: true,
    data: rewards,
    message: "User rewards fetched successfully",
  });
});

export const getActivityHeatmap = asyncHandler(
  async (req: any, res: Response) => {
    const userId = req.user;
    if (!userId) {
      throw new CustomError("Unauthorized", 401);
    }

    const heatmap = await activityService.getActivityHeatmap(userId);
    res.status(200).json({
      success: true,
      data: heatmap,
      message: "Activity heatmap fetched successfully",
    });
  },
);

// Leaderboard Controllers (previously in ActivityLeaderboardService)
export const getXPLeaderboard = asyncHandler(
  async (req: Request, res: Response) => {
    const type = (req.query.type as activity_time_range) || "weekly";
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await activityService.getXPLeaderboard(type, limit);
    res
      .status(200)
      .json({ success: true, data, message: "XP leaderboard fetched" });
  },
);

export const getQuizLeaderboard = asyncHandler(
  async (req: Request, res: Response) => {
    const type = (req.query.type as activity_time_range) || "weekly";
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await activityService.getQuizLeaderboard(type, limit);
    res
      .status(200)
      .json({ success: true, data, message: "Quiz leaderboard fetched" });
  },
);

export const getStreakLeaderboard = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await activityService.getStreakLeaderboard(limit);
    res
      .status(200)
      .json({ success: true, data, message: "Streak leaderboard fetched" });
  },
);
