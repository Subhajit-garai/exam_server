import { Router } from "express";
import {
    getTimelines,
    getAllTimelines,
    createTimeline,
    updateTimeline,
    deleteTimeline,
} from "../controllers/examTimeline.controller.js";
import { isAdmin } from "@repo/lib/security/auth.js";

export const examTimelineRouter = Router();

examTimelineRouter.get("/", getTimelines);
examTimelineRouter.get("/all", getAllTimelines);
examTimelineRouter.post("/create", isAdmin, createTimeline);
examTimelineRouter.put("/update", isAdmin, updateTimeline);
examTimelineRouter.delete("/delete", isAdmin, deleteTimeline);
