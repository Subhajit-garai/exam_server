import { Router } from "express";
import { isAdmin } from "@repo/lib/security/auth.js";
import {
    createProcessedQuestion,
    getProcessedQuestions,
    reviewQuestion,
    deleteProcessedQuestion,
    updateProcessedQuestion
} from "../controllers/questionprocessing.controller.js";

export const questionProcessingAdminRouter = Router();
export const questionProcessingPublicRouter = Router();

// Public Routes (User)
questionProcessingPublicRouter.post("/", createProcessedQuestion);

// Admin Routes (Protected)
questionProcessingAdminRouter.get("/", isAdmin, getProcessedQuestions);
questionProcessingAdminRouter.post("/:id/review", isAdmin, reviewQuestion);
questionProcessingAdminRouter.delete("/:id", isAdmin, deleteProcessedQuestion);
questionProcessingAdminRouter.put("/:id", isAdmin, updateProcessedQuestion);
