import { Router } from "express";
import {
  createQuestion,
  getAllQuestions,
  getQuestion,
  getQuestionalldatabyID,
  GetQuestionExplanation,
  updateQuestion,
  deleteQuestion,
} from "../controllers/question.controller.js";


export const questionAdminRouter = Router();
export const questionPublicRouter = Router();

// Public Routes
questionPublicRouter.get("/getquestionexplanation", GetQuestionExplanation);

// Admin Routes (Protected)
questionAdminRouter.post("/create", createQuestion);
questionAdminRouter.get("/:id", getQuestion);
questionAdminRouter.get("/alldata/:id", getQuestionalldatabyID);
questionAdminRouter.get("/allquestions", getAllQuestions);
questionAdminRouter.put("/update", updateQuestion);
questionAdminRouter.delete("/:id", deleteQuestion);




