import { Router } from "express";
import { isAdmin } from "@repo/lib/security/auth.js";
import { updateAppConfig, SendAppConfig, getAllbotUser } from "../controllers/settings.controller.js";
import { addbotToken, createNewBot, setQuizTopic, updateBotWebhook } from "@/controllers/bot/bot.admin.controller.js";
import { examTimelineAdminRouter } from "./examTimeline.routes.js";
import { syllabusAdminRouter } from "./syllabusRouter.js";
import { categoryAdminRouter } from "./category.routes.js";
import { eventAdminRouter } from "./eventRouter.js";
import { mockRouter } from "./mock.router.js";
import { questionAdminRouter } from "./questionsRoutes.js";
import { questionProcessingAdminRouter } from "./questionprocessing.routes.js";
import { IssueAdminRouter } from "./IssueRouter.js";
import { noteAdminRouter } from "./noteRoute.js";
import { examAdminRouter } from "./examRoutes.js";



export const adminRouter = Router();

adminRouter.put("/settings/update/appconfig", updateAppConfig)
adminRouter.get("/settings/get/appconfig", SendAppConfig)
adminRouter.get("/bot/get/all", getAllbotUser)


adminRouter.post("/setquiztopic", setQuizTopic);
adminRouter.post("/setToken", addbotToken)

adminRouter.post("/bot/create", createNewBot)
adminRouter.put("/bot/botWebhook", updateBotWebhook)
// adminRouter.post("/event",isAdmin, addbotToken)

adminRouter.use("/timeline", examTimelineAdminRouter)
adminRouter.use("/syllabus", syllabusAdminRouter)
adminRouter.use("/event", eventAdminRouter)
adminRouter.use("/category", categoryAdminRouter)
adminRouter.use("/mock", mockRouter)
adminRouter.use("/question", questionAdminRouter)
adminRouter.use("/question-processing", questionProcessingAdminRouter)
adminRouter.use("/issue", IssueAdminRouter)
adminRouter.use("/note", noteAdminRouter)
adminRouter.use("/exam", examAdminRouter)
