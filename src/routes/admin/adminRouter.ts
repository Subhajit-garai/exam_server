import { Router } from "express";
import { updateAppConfig, SendAppConfig, getAllbotUser } from "../../controllers/settings.controller.js";
import { examTimelineAdminRouter } from "./examTimeline.admin.routes.js";
import { syllabusAdminRouter } from "./syllabus.admin.routes.js";
import { categoryAdminRouter } from "./category.admin.routes.js";
import { eventAdminRouter } from "./event.admin.routes.js";

import { mockRouter } from "./mock.admin.routes.js";
import { questionAdminRouter } from "./question.admin.routes.js";
import { questionProcessingAdminRouter } from "./questionprocessing.admin.routes.js";
import { IssueAdminRouter } from "./issue.admin.routes.js";
import { noteAdminRouter } from "./note.admin.routes.js";
import { examAdminRouter } from "./exam.admin.routes.js";
import { examPatternAdminRouter } from "./examPattern.admin.routes.js";
import { offerRouter } from "./offer.admin.routes.js";
import { subscriptionRouter } from "./subscription.admin.routes.js";
import { dashboardRouter } from "./dashboard.admin.routes.js";
import { couponRouter } from "./coupon.admin.routes.js";




export const adminRouter = Router();

adminRouter.put("/settings/update/appconfig", updateAppConfig)
adminRouter.get("/settings/get/appconfig", SendAppConfig)
adminRouter.get("/bot/get/all", getAllbotUser)
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
adminRouter.use("/exampattern", examPatternAdminRouter)
adminRouter.use("/offer", offerRouter)
adminRouter.use("/subscription", subscriptionRouter)
adminRouter.use("/dashboard", dashboardRouter)
adminRouter.use("/coupon", couponRouter)
