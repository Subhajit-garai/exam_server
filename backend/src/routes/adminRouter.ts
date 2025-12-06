import { Router } from "express";
import { isAdmin } from "@repo/lib/security/auth.js";
import { updateAppConfig, SendAppConfig, getAllbotUser } from "../controllers/settings.controller.js";
import { addbotToken, createNewBot, setQuizTopic, updateBotWebhook } from "@/controllers/bot/bot.admin.controller.js";
import { examTimelineRouter } from "./examTimeline.routes.js";
import { categoryRouter } from "./category.routes.js";



export const adminRouter = Router();

adminRouter.put("/settings/update/appconfig", isAdmin, updateAppConfig)
adminRouter.get("/settings/get/appconfig", isAdmin, SendAppConfig)
adminRouter.get("/bot/get/all", isAdmin, getAllbotUser)


adminRouter.post("/setquiztopic", isAdmin, setQuizTopic);
adminRouter.post("/setToken", isAdmin, addbotToken)

adminRouter.post("/bot/create", isAdmin, createNewBot)
adminRouter.put("/bot/botWebhook", isAdmin, updateBotWebhook)
// adminRouter.post("/event",isAdmin, addbotToken)

adminRouter.use("/timeline", examTimelineRouter)
adminRouter.use("/category", categoryRouter)
