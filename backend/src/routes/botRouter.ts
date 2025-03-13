import { Router } from "express";
// import { SelectQuestion } from "../controllers/question.controller";
import { botauthenticate } from "../middleware/botauth";
import { addbotToken ,requesttoprimestatus,sendQuizTopic,setrQuizTopic} from "../controllers/bot.controller";
export const botRouter = Router();

botRouter.get("/auth", botauthenticate, (req, res) => {
  res.json({ success: true, message: "bot validate successfully" });
});
botRouter.post("/setToken", addbotToken)
// botRouter.get("/getquestionstest", botauthenticate, SelectQuestion);
botRouter.post("/requesttoprimestatus", botauthenticate, requesttoprimestatus);
botRouter.post("/setquiztopic", botauthenticate, setrQuizTopic);
botRouter.get("/getquiztopic", botauthenticate, sendQuizTopic);
