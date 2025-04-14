import { Router } from "express";
import { isAdmin } from "../../lib/auth";
import { addbotToken, createNewBot, setQuizTopic, updateBotWebhook } from "../controllers/bot.controller";


export const adminRouter = Router();


adminRouter.post("/")


adminRouter.post("/setquiztopic", isAdmin, setQuizTopic);
adminRouter.post("/setToken",isAdmin, addbotToken)
adminRouter.post("/bot/create",isAdmin, createNewBot)
adminRouter.put("/bot/botWebhook",isAdmin, updateBotWebhook)
// adminRouter.post("/setToken",isAdmin, addbotToken)