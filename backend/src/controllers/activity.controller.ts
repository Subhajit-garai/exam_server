import { Request, Response } from "express";
import { ActivityService } from "../services/activity.service.js";
import { CompleteActivitySchema, createActivitySchema } from "../zod/activity.zod.js";
import { asyncHandler } from "@/lib/helper/asyncHandler.js";

const activityService = new ActivityService();

export const getDailyChallenge = asyncHandler(async (req: Request, res: Response) => {

    const challenge = await activityService.getDailyChallenge();
    res.status(200).json({
        success: true,
        data: challenge,
        message: "Daily challenge fetched successfully",
    });

})

export const completeDailyChallenge = asyncHandler(async (req: Request, res: Response) => {

    // Validate input
    const validation = CompleteActivitySchema.safeParse(req.body);
    if (!validation.success) {
        res.status(400).json({ message: "Invalid input", errors: validation.error.errors });
        return;
    }

    const result = await activityService.completeActivity(validation.data);
    res.status(200).json({
        success: true,
        data: result,
        message: "Activity completed successfully",
    });

});

export const getLeaderboard = asyncHandler(async (req: Request, res: Response) => {

    const type = req.query.type === 'global' ? 'global' : 'weekly';
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const leaderboard = await activityService.getLeaderboard(type, limit);
    res.status(200).json({
        success: true,
        data: leaderboard,
        message: "Leaderboard fetched successfully",
    });
});

export const getUserStats = asyncHandler(async (req: Request, res: Response) => {

    const userId = req.params.userId;
    if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
    }
    const stats = await activityService.getUserStats(userId);
    res.status(200).json({
        success: true,
        data: stats,
        message: "User stats fetched successfully",
    });
});


// New methods for Recent Activity replacement

export const logActivity = asyncHandler(async (req: Request, res: Response) => {

    const userId = (req as any).user; // Assuming auth middleware sets this
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const validation = createActivitySchema.safeParse(req.body);
    if (!validation.success) {
        res.status(400).json({ message: "Invalid input", errors: validation.error.errors });
        return;
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
        res.status(401).json({ message: "Unauthorized" });
        return;
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
