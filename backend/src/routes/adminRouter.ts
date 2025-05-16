import { Router } from "express";
import { isAdmin } from "../../lib/auth";
import { addbotToken, createNewBot, setQuizTopic, updateBotWebhook } from "../controllers/bot.controller";
import { updateAppConfig ,SendAppConfig } from "../controllers/settings.controller";


export const adminRouter = Router();

adminRouter.put("/settings/update/appconfig" , isAdmin , updateAppConfig)
adminRouter.get("/settings/get/appconfig" , isAdmin , SendAppConfig)


adminRouter.post("/setquiztopic", isAdmin, setQuizTopic);
adminRouter.post("/setToken",isAdmin, addbotToken)
adminRouter.post("/bot/create",isAdmin, createNewBot)
adminRouter.put("/bot/botWebhook",isAdmin, updateBotWebhook)
// adminRouter.post("/event",isAdmin, addbotToken)