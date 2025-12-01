import { Router } from "express";
import {
    getDailyChallenge,
    completeDailyChallenge,
    getLeaderboard,
    getUserStats,
    logActivity,
    getRecentActivities,
} from "../controllers/activity.controller.js";
import { leaderboardRouter } from "./activity/leaderboard.routes.js";

export const activityRouter = Router();

activityRouter.get("/challenge/daily", getDailyChallenge);
activityRouter.post("/challenge/daily/complete", completeDailyChallenge);
activityRouter.get("/leaderboard", getLeaderboard);
activityRouter.get("/stats", getUserStats);

// Recent Activity Routes
activityRouter.post("/log", logActivity);
activityRouter.get("/recent", getRecentActivities);
activityRouter.use("/leaderboard", leaderboardRouter);
