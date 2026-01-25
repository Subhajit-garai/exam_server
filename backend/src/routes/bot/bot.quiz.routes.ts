import { getQuizConfigdData, getQuizTopic, sentQuizData } from "@/controllers/bot/bot.quiz.controller";
import { Router } from "express";
export const botQuizRouter = Router();



//quiz
botQuizRouter.get("/getquiztopic", getQuizTopic);
botQuizRouter.get("/get/quiz/config", getQuizConfigdData);
botQuizRouter.post("/getquestionsset", sentQuizData);  //  auto / daily quiz set

