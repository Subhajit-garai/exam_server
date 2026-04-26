import { Router } from "express";
import {
    getTimelines,
} from "../../controllers/examTimeline.controller.js";

export const examTimelinePublicRouter = Router();

// Public Routes
examTimelinePublicRouter.get("/", getTimelines);

