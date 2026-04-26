import { Router } from "express";
import {
    createProcessedQuestion,
} from "../controllers/questionprocessing.controller.js";

export const questionProcessingPublicRouter = Router();

// Public Routes (User)
questionProcessingPublicRouter.post("/", createProcessedQuestion);

