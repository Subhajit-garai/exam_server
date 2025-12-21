import { Router } from "express";
import {
    trackTopicProgress,
    updateTopicStatus,
    getSyllabusProgress,
    getDashboardStats,
    getStudyHours,
    getTestsAttempted,
    getAvgScore,
    getAccuracy
} from "../controllers/progress.controller.js";
import { userauthenticate } from "@repo/lib/security/auth.js";

export const progressRouter = Router();

// Track time on topic - POST /api/v1/progress/track
progressRouter.post("/track", userauthenticate, trackTopicProgress);

// Update topic status - PUT /api/v1/progress/status
progressRouter.put("/status", userauthenticate, updateTopicStatus);

// Get syllabus progress - GET /api/v1/progress/syllabus/:examYearId
progressRouter.get("/syllabus/:examYearId", getSyllabusProgress);

// Combined Stats (Legacy/All-in-one)
progressRouter.get("/dashboard-stats", getDashboardStats);

// Separate Stats Endpoints
progressRouter.get("/stats/study-hours", getStudyHours);
progressRouter.get("/stats/tests-attempted", getTestsAttempted);
progressRouter.get("/stats/avg-score", getAvgScore);
progressRouter.get("/stats/accuracy", getAccuracy);
