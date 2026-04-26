import { Router } from "express";
import {
  GetQuestionExplanation,
} from "../controllers/question.controller.js";

export const questionPublicRouter = Router();

// Public Routes
questionPublicRouter.get("/getquestionexplanation", GetQuestionExplanation);





