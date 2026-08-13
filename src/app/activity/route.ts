import { Router } from "express";
import {
  getDailyChallenge,
  getDailyChallengeHistory,
  completeDailyChallenge,
  getUserStats,
  logActivity,
  getRecentActivities,
  getActivityHeatmap,
  getQuizLeaderboard,
  getXPLeaderboard,
  getStreakLeaderboard,
} from "./controller.js";

export const activityRouter = Router();

activityRouter.get("/challenge/daily", getDailyChallenge);
activityRouter.get("/challenge/history", getDailyChallengeHistory);
activityRouter.post("/challenge/daily/complete", completeDailyChallenge);
activityRouter.get("/stats", getUserStats);
activityRouter.post("/log", logActivity);
activityRouter.get("/recent", getRecentActivities);
activityRouter.get("/heatmap", getActivityHeatmap);

// Leaderboard routes
activityRouter.get("/leaderboard/quiz", getQuizLeaderboard);
activityRouter.get("/leaderboard/xp", getXPLeaderboard);
activityRouter.get("/leaderboard/streak", getStreakLeaderboard);
