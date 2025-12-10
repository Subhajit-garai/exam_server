import { Router } from "express";
import {
    getTimelines,
    getAllTimelines,
    createTimeline,
    updateTimeline,
    deleteTimeline,
} from "../controllers/examTimeline.controller.js";

export const examTimelineAdminRouter = Router();
export const examTimelinePublicRouter = Router();

// Public Routes
examTimelinePublicRouter.get("/", getTimelines);

// Admin Routes (Protected)
examTimelineAdminRouter.get("/all", getAllTimelines);
examTimelineAdminRouter.post("/create", createTimeline);
examTimelineAdminRouter.put("/update", updateTimeline);
examTimelineAdminRouter.delete("/delete", deleteTimeline);
