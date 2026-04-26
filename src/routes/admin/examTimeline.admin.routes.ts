import { Router } from "express";
import {
    getAllTimelines,
    createTimeline,
    updateTimeline,
    deleteTimeline,
} from "../../controllers/examTimeline.controller.js";

export const examTimelineAdminRouter = Router();

// Admin Routes (Protected)
examTimelineAdminRouter.get("/all", getAllTimelines);
examTimelineAdminRouter.post("/create", createTimeline);
examTimelineAdminRouter.put("/update", updateTimeline);
examTimelineAdminRouter.delete("/delete", deleteTimeline);
