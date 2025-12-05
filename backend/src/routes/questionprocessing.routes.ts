import { Router } from "express";
import { isAdmin } from "@repo/lib/security/auth.js";
import {
    createProcessedQuestion,
    getProcessedQuestions,
    reviewQuestion,
    deleteProcessedQuestion,
    updateProcessedQuestion
} from "../controllers/questionprocessing.controller.js";

export const questionProcessingRouter = Router();

// User routes (or maybe restricted to certain roles?)
// Assuming authenticated users can submit questions
questionProcessingRouter.post("/", createProcessedQuestion);

// Admin routes
questionProcessingRouter.get("/", isAdmin, getProcessedQuestions);
questionProcessingRouter.post("/:id/review", isAdmin, reviewQuestion);
questionProcessingRouter.delete("/:id", isAdmin, deleteProcessedQuestion);
questionProcessingRouter.put("/:id", isAdmin, updateProcessedQuestion);
