import { getAvailableExamPattern } from "@/controllers/exampattern.controller.js";
import { Router } from "express";

export const examPatternPublicRouter = Router();

// Public Routes
examPatternPublicRouter.get("/list", getAvailableExamPattern);

