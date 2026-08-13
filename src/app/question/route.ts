import { Router } from "express";
import {
  GetQuestionExplanation,
  createQuestion,
  getAllQuestions,
  getQuestion,
  getQuestionalldatabyID,
  updateQuestion,
  deleteQuestion,
  getSubjectCounts,
  getTopicCounts,
  createProcessedQuestion,
  getProcessedQuestions,
  reviewQuestion,
  deleteProcessedQuestion,
  updateProcessedQuestion,
} from "./controller.js";
import { isAdmin } from "@repo/lib/security/auth.js";

// Public Routers
export const questionPublicRouter = Router();
export const questionProcessingPublicRouter = Router();

// Admin Routers
export const questionAdminRouter = Router();
export const questionProcessingAdminRouter = Router();

// Question Public Routes
questionPublicRouter.get("/getquestionexplanation", GetQuestionExplanation);

// Question Processing Public Routes (User)
questionProcessingPublicRouter.post("/", createProcessedQuestion);

// Question Admin Routes (Protected)
questionAdminRouter.post("/create", createQuestion);
questionAdminRouter.get("/allquestions", getAllQuestions);
questionAdminRouter.get("/alldata/:id", getQuestionalldatabyID);
questionAdminRouter.put("/update", updateQuestion);
questionAdminRouter.get("/:id", getQuestion);
questionAdminRouter.delete("/:id", deleteQuestion);
questionAdminRouter.get("/map/subject-counts", getSubjectCounts);
questionAdminRouter.get("/map/topic-counts/:subjectId", getTopicCounts);

// Question Processing Admin Routes (Protected)
questionProcessingAdminRouter.get("/", isAdmin, getProcessedQuestions);
questionProcessingAdminRouter.post("/:id/review", isAdmin, reviewQuestion);
questionProcessingAdminRouter.delete("/:id", isAdmin, deleteProcessedQuestion);
questionProcessingAdminRouter.put("/:id", isAdmin, updateProcessedQuestion);
