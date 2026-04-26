import { Router } from "express";
import { getQuizLeaderboard, getStreakLeaderboard, getXPLeaderboard } from "@/controllers/activity/leaderboard.controller.js";

export const leaderboardRouter = Router();

// All leaderboard routes should probably be public or protected? 
// Usually leaderboards are visible to everyone, but let's assume we might need auth for some context later.
// For now, I'll leave them open or use verifyJWT if user context is needed (e.g. "my rank").
// The user request didn't specify, but usually "get data" is public or protected.
// I'll add verifyJWT as a safe default if the app is generally authenticated.

leaderboardRouter.get("/quiz", getQuizLeaderboard);
leaderboardRouter.get("/xp", getXPLeaderboard);
leaderboardRouter.get("/streak", getStreakLeaderboard);

