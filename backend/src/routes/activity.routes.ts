import { Router } from "express";
import {
    getDailyChallenge,
    getDailyChallengeHistory,
    completeDailyChallenge,
    getUserStats,
    logActivity,
    getRecentActivities,
    getActivityHeatmap
} from "../controllers/activity.controller.js";
import { leaderboardRouter } from "./activity/leaderboard.routes.js";


export const activityRouter = Router();

activityRouter.get("/challenge/daily", getDailyChallenge);
activityRouter.get("/challenge/history", getDailyChallengeHistory);
activityRouter.post("/challenge/daily/complete", completeDailyChallenge);
activityRouter.get("/stats", getUserStats);
// Recent Activity Routes
activityRouter.post("/log", logActivity);
activityRouter.get("/recent", getRecentActivities);
activityRouter.get("/heatmap", getActivityHeatmap);
activityRouter.use("/leaderboard", leaderboardRouter);

