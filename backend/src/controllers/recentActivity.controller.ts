import { asyncHandler } from "@/lib/helper/asyncHandler.js";
import { Request, Response } from "express";
import { ActivityService } from "../services/recentActivity.service.js";
import { createActivitySchema } from "../zod/recentActivity.zod.js";
import { ZodDataSafeParse } from "@/lib/ZodTypeChecker.js";

interface AuthenticatedRequest extends Request {
  user: string;
}

const activityService = new ActivityService();

// ### Create a new activity
export const createActivity = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }



  // 1. Structural Validation (Controller)
  const processedData = createActivitySchema.safeParse(req.body);


  if (!processedData.success) {
    throw ZodDataSafeParse(processedData);
  }

  // 2. Business Logic (Service)
  const newActivity = await activityService.create(userId, processedData.data);

  res.status(201).json(newActivity);
});

// ### Fetch recent activities for a user
export const getRecentActivities = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // 2. Business Logic (Service)
  const activities = await activityService.getUserActivities(userId);

  // 3. View Logic (Controller/Presenter) - Formatting for Frontend
  const formattedActivities = activities.map((activity) => ({
    title: activity.title,
    score: activity.score || "Pending",
    status: activity.status,
    date: activity.completedAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  }));

  res.json(formattedActivities);
});
