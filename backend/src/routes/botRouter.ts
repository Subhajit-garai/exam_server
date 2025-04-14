import { Router } from "express";
// import { SelectQuestion } from "../controllers/question.controller";
import { botauthenticate } from "../middleware/botauth";
import { getQuizData, getQuizTopic ,bot_login } from "../controllers/bot.controller";
export const botRouter = Router();

botRouter.get("/auth", botauthenticate, (req, res) => {
  res.json({ success: true, message: "bot validate successfully" });
});


botRouter.get("/getquiztopic", botauthenticate, getQuizTopic);

botRouter.post("/getquestionsset", botauthenticate,getQuizData);  //  auto / daily quiz set
botRouter.post("/login", bot_login);



