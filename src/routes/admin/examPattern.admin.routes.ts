import { CreateNewExamPattern, deleteExamPattern, getExamPatternById, updateExamPattern } from "../../controllers/exampattern.controller.js";
import { Router } from "express";

export const examPatternAdminRouter = Router();

// Admin Routes (Protected)
examPatternAdminRouter.post("/create", CreateNewExamPattern);
examPatternAdminRouter.get("/:id", getExamPatternById);
examPatternAdminRouter.put("/update", updateExamPattern);
examPatternAdminRouter.delete("/:id", deleteExamPattern);
