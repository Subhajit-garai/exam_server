import { Router } from "express";
import { botauthenticate } from "@/middleware/botauth.js";

import { botUserRouter } from "./bot.user.routes";
import { botExamRouter } from "./bot.exam.routes";
import { botQuestionRouter } from "./bot.question.routes";
import { botQuizRouter } from "./bot.quiz.routes";
import { botTelegramRouter } from "./bot.telegram.routes";

import { bot_login } from "@/controllers/bot/bot.telegram.controller.js";
import { getExamPattern, getMockSetExamPattern } from "@/controllers/bot/bot.exampattern.controller.js";
import { getSyllabusDataForExamCreattion, processNotification } from "@/controllers/bot.controller.js";

export const botRouter = Router();
export const botSecureRouter = Router();

botRouter.get("/auth", (req, res) => {
  res.json({ success: true, message: "bot validate successfully" });
});

botRouter.post("/login", bot_login);
botRouter.use("/", botauthenticate, botSecureRouter);



botSecureRouter.use("/user", botUserRouter);
botSecureRouter.use("/exam", botExamRouter);
botSecureRouter.use("/question", botQuestionRouter);
botSecureRouter.use("/quiz", botQuizRouter);
botSecureRouter.use("/telegram", botTelegramRouter);




botSecureRouter.get("/exampattern/get/:exampatternid", getExamPattern);
botSecureRouter.get("/mock/exampattern/details/get", getMockSetExamPattern);
//syllabus
botSecureRouter.get("/syllabus/exam/get", getSyllabusDataForExamCreattion);
botSecureRouter.post("/notification", processNotification)

// Fallback for unmatched bot routes to prevent falling through to user auth
botRouter.use((req, res) => {
  res.status(404).json({ success: false, message: "Bot route not found" });
});


