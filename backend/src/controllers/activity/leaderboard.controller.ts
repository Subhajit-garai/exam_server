import { Request, Response } from "express";
import { asyncHandler } from "@repo/lib/helper/asyncHandler.js";
import { activity_time_range, ActivityLeaderboardService } from "../../services/activity/activity.leaderboard.service.js";

const leaderboardService = new ActivityLeaderboardService();

export const getQuizLeaderboard = asyncHandler(async (req: Request, res: Response) => {
    const type = (req.query.type as activity_time_range) || 'weekly';
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await leaderboardService.getQuizLeaderboard(type, limit);
    res.status(200).json({ success: true, data: leaderboard });
});

export const getXPLeaderboard = asyncHandler(async (req: Request, res: Response) => {
    const type = (req.query.type as activity_time_range) || 'weekly';
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await leaderboardService.getXPLeaderboard(type, limit);
    res.status(200).json({ success: true, data: leaderboard });
});

export const getStreakLeaderboard = asyncHandler(async (req: Request, res: Response) => {
    const type = (req.query.type as activity_time_range) || 'weekly';
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await leaderboardService.getStreakLeaderboard(type, limit);
    res.status(200).json({ success: true, data: leaderboard });
});
