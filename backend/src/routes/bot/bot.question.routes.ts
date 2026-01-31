import { Router } from "express";

import { AddProcessingQuestions, getQuestionViaIds, getQuestionViaIdsforProcessing } from "@/controllers/bot.controller.js";
import { getExamAns } from "@/controllers/bot/bot.ans.controller.js";
import { addQuestions, getQuestions, getQuestionsByids, getQuestionsIds } from "@/controllers/bot/bot.question.controller.js";

export const botQuestionRouter = Router();




//question
botQuestionRouter.post("/processing/get/simple", getQuestionViaIdsforProcessing); //remove 
botQuestionRouter.post("/processing/get", getQuestionViaIdsforProcessing);
botQuestionRouter.post("/processed/add", AddProcessingQuestions);

//questions
botQuestionRouter.get("/info/get", getQuestionViaIds);
botQuestionRouter.get("/ans/get/:examid", getExamAns);
botQuestionRouter.get("/ids", getQuestionsIds);
botQuestionRouter.get("/get", getQuestions);
botQuestionRouter.post("/get/byids", getQuestionsByids);
botQuestionRouter.post("/add/:examid", addQuestions);