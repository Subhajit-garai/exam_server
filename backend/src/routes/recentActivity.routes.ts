import { Router } from "express";
import { createActivity, getRecentActivities } from "../controllers/recentActivity.controller.js";
import { userauthenticate } from "@repo/lib/security/auth.js";

export const recentActivityRouter = Router();

// Apply authentication middleware to all routes
recentActivityRouter.use(userauthenticate);

recentActivityRouter.post("/", createActivity);
recentActivityRouter.get("/", getRecentActivities);
