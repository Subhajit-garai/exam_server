import { Request, Response } from "express";
import { ActivityService } from "../services/activity.service.js";
import { CompleteActivitySchema, createActivitySchema } from "../zod/activity.zod.js";
import { asyncHandler } from "@repo/lib/helper/asyncHandler.js";
import { activity_time_range, ActivityLeaderboardService } from "@/services/activity/activity.leaderboard.service.js";
import { CustomError } from "@/middleware/globalErrorHandler.js";


const activityService = new ActivityService();
const leaderboardService = new ActivityLeaderboardService();

export const getDailyChallenge = asyncHandler(async (req: Request, res: Response) => {

    const challenge = await activityService.getDailyChallenge();
    res.status(200).json({
        success: true,
        data: challenge,
        message: "Daily challenge fetched successfully",
    });

})

export const getDailyChallengeHistory = asyncHandler(async (req: Request, res: Response) => {

    const challenge = await activityService.getDailyChallengeHistory();
    res.status(200).json({
        success: true,
        data: challenge,
        message: "Daily challenge history fetched successfully",
    });

})


export const completeDailyChallenge = asyncHandler(async (req: Request, res: Response) => {

    // Validate input
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

});

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


// New methods for Recent Activity replacement

export const logActivity = asyncHandler(async (req: any, res: Response) => {

    const userId = req.user; // Assuming auth middleware sets this
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

})

export const getRecentActivities = asyncHandler(async (req: Request, res: Response) => {

    const userId = (req as any).user;
    if (!userId) {
        throw new CustomError("Unauthorized", 401);
    }


    const activities = await activityService.getRecentActivities(userId);

    // Format for frontend
    const formattedActivities = activities.map((activity) => ({
        title: activity.title,
        score: activity.score,
        status: activity.status,
        date: activity.completedAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }),
        activityType: activity.activityType
    }));

    res.status(200).json({
        success: true,
        data: formattedActivities,
        message: "Recent activities fetched successfully",
    });
});

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

export const getActivityHeatmap = asyncHandler(async (req: any, res: Response) => {
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
});
