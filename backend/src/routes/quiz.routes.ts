import express from "express";
import { createUserQuiz, getAvailableQuizzes } from "../controllers/quiz.controller.js";

export const quizRouter = express.Router();

quizRouter.post("/user/create", createUserQuiz);
quizRouter.get("/available", getAvailableQuizzes);
