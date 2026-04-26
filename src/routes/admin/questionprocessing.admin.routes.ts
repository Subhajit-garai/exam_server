import { Router } from "express";
import { isAdmin } from "@repo/lib/security/auth.js";
import {
    getProcessedQuestions,
    reviewQuestion,
    deleteProcessedQuestion,
    updateProcessedQuestion
} from "../../controllers/questionprocessing.controller.js";

export const questionProcessingAdminRouter = Router();

// Admin Routes (Protected)
questionProcessingAdminRouter.get("/", isAdmin, getProcessedQuestions);
questionProcessingAdminRouter.post("/:id/review", isAdmin, reviewQuestion);
questionProcessingAdminRouter.delete("/:id", isAdmin, deleteProcessedQuestion);
questionProcessingAdminRouter.put("/:id", isAdmin, updateProcessedQuestion);
