import express from "express";
import { createUserQuiz, getAvailableQuizzes, getLeaderboard } from "../controllers/quiz.controller.js";

export const quizRouter = express.Router();

quizRouter.post("/user/create", createUserQuiz);
quizRouter.get("/available", getAvailableQuizzes);
quizRouter.get("/leaderboard", getLeaderboard);
