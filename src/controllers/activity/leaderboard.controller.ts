import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { activity_time_range, ActivityService } from "@/services/activity.service.js";

const activityService = new ActivityService();

export const getQuizLeaderboard = asyncHandler(async (req: Request, res: Response) => {
    const type = (req.query.type as activity_time_range) || 'weekly';
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await activityService.getQuizLeaderboard(type, limit);
    res.status(200).json({ success: true, data: leaderboard });
});

export const getXPLeaderboard = asyncHandler(async (req: Request, res: Response) => {
    const type = (req.query.type as activity_time_range) || 'weekly';
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await activityService.getXPLeaderboard(type, limit);
    res.status(200).json({ success: true, data: leaderboard });
});

export const getStreakLeaderboard = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await activityService.getStreakLeaderboard(limit);
    res.status(200).json({ success: true, data: leaderboard });
});
