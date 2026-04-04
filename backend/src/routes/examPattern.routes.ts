import { CreateNewExamPattern, deleteExamPattern, getAvailableExamPattern, getExamPatternById, updateExamPattern } from "@/controllers/exampattern.controller.js";
import { Router } from "express";


export const examPatternAdminRouter = Router();
export const examPatternPublicRouter = Router();

// Public Routes
examPatternPublicRouter.get("/list", getAvailableExamPattern); // Changed from /avalibleExamPattern to /list for cleaner API if mounted at /exampattern

// Admin Routes (Protected)
examPatternAdminRouter.post("/create", CreateNewExamPattern); // /create
examPatternAdminRouter.get("/:id", getExamPatternById); // /:id
examPatternAdminRouter.put("/update", updateExamPattern); // /update
examPatternAdminRouter.delete("/:id", deleteExamPattern); // /:id
