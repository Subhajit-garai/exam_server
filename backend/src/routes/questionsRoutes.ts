import { Router } from "express";
import {
  createQuestion,
  getAllQuestions,
  getQuestion,
  getQuestionalldatabyID,
  GetQuestionExplanation,
  updateQuestion,
  deleteQuestion,
  getSubjectCounts,
  getTopicCounts,
} from "../controllers/question.controller.js";


export const questionAdminRouter = Router();
export const questionPublicRouter = Router();

// Public Routes
questionPublicRouter.get("/getquestionexplanation", GetQuestionExplanation);

// Admin Routes (Protected)
questionAdminRouter.post("/create", createQuestion);
questionAdminRouter.get("/allquestions", getAllQuestions);
questionAdminRouter.get("/alldata/:id", getQuestionalldatabyID);
questionAdminRouter.put("/update", updateQuestion);
questionAdminRouter.get("/:id", getQuestion);
questionAdminRouter.delete("/:id", deleteQuestion);

// Map endpoint routes
questionAdminRouter.get("/map/subject-counts", getSubjectCounts);
questionAdminRouter.get("/map/topic-counts/:subjectId", getTopicCounts);




