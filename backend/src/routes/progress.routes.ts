import { Router } from "express";
import { trackTopicProgress, updateTopicStatus, getSyllabusProgress } from "../controllers/progress.controller.js";
import { userauthenticate } from "@repo/lib/security/auth.js";

export const progressRouter = Router();

// Apply auth middleware to all routes
progressRouter.use(userauthenticate);

// Track time spent (Heartbeat) - POST /api/v1/progress/track
progressRouter.post("/track", trackTopicProgress);

// Update status (Mark complete) - PUT /api/v1/progress/status
progressRouter.put("/status", updateTopicStatus);

// Get syllabus progress - GET /api/v1/progress/syllabus/:examYearId
progressRouter.get("/syllabus/:examYearId", getSyllabusProgress);
