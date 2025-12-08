import { Router } from "express";
import {
  createQuestion,
  getAllQuestions,
  getQuestion,
  getQuestionalldatabyID,
  GetQuestionExplanation,
  updateQuestion,
} from "../controllers/question.controller.js";
import { isAdmin } from "@repo/lib/security/auth.js";


export const questionRouter = Router();



questionRouter.post("/admin/create", isAdmin, createQuestion);
questionRouter.get("/getquestionexplanation", GetQuestionExplanation);
questionRouter.get("/:id", isAdmin, getQuestion);
questionRouter.get("/alldata/:id", isAdmin, getQuestionalldatabyID);
questionRouter.get("/admin/allquestions", isAdmin, getAllQuestions);
// new in development
// questionRouter.post("/admin/prossing" ,isAdmin,QuestionProssingDataFetch)
questionRouter.put("/admin/update", isAdmin, updateQuestion);




