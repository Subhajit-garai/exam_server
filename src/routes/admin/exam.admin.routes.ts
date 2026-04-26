import { Router } from "express";
import {
  CreateExam,
  refreshExam,
} from "../../controllers/exam.controller.js";
import { create_targeted_exam, fetchTargetedExamById } from "../../controllers/targetexam.controller.js";
import { create_targeted_exam_year, updateTargetedExamYear } from "../../controllers/targetexamyear.controller.js";

export const examAdminRouter = Router();

// Admin Routes (Protected)
examAdminRouter.post("/get/target/exam/id", fetchTargetedExamById);
examAdminRouter.post("/create", CreateExam);
examAdminRouter.post("/create/target/exam", create_targeted_exam);
examAdminRouter.post("/create/target/examyear", create_targeted_exam_year);
examAdminRouter.put("/update/target/examyear/info", updateTargetedExamYear);
examAdminRouter.post("/refresh/:examid", refreshExam);
