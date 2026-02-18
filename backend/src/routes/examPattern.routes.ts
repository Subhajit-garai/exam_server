import { Router } from "express";
import {
    getAvailableExamPattern,
    getExamPatternById,
    updateExamPattern,
    deleteExamPattern,
} from "../controllers/exam.controller.js";
import { CreateNewExamPattern } from "@/controllers/exam/exam.create.controller.js";

export const examPatternAdminRouter = Router();
export const examPatternPublicRouter = Router();

// Public Routes
examPatternPublicRouter.get("/list", getAvailableExamPattern); // Changed from /avalibleExamPattern to /list for cleaner API if mounted at /exampattern

// Admin Routes (Protected)
examPatternAdminRouter.post("/create", CreateNewExamPattern); // /create
examPatternAdminRouter.get("/:id", getExamPatternById); // /:id
examPatternAdminRouter.put("/update", updateExamPattern); // /update
examPatternAdminRouter.delete("/:id", deleteExamPattern); // /:id
