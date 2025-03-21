import { Router } from "express";
// import { SelectQuestion } from "../controllers/question.controller";
import { botauthenticate } from "../middleware/botauth";
import { addbotToken } from "../controllers/bot.controller";
import { getquestionsset, sendQuizTopic, setrQuizTopic } from "../controllers/quiz.controller";
export const botRouter = Router();

botRouter.get("/auth", botauthenticate, (req, res) => {
  res.json({ success: true, message: "bot validate successfully" });
});
botRouter.get("/getquestionsset", botauthenticate,getquestionsset);
botRouter.get("/getquiztopic", botauthenticate, sendQuizTopic);



botRouter.post("/setquiztopic", botauthenticate, setrQuizTopic);
botRouter.post("/setToken", addbotToken)
