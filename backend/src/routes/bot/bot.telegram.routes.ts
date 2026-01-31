
import { AllUserData, isGroupJoinable, sendGroupinfo, sendGroupTopicinfo, sendValidchatids } from "@/controllers/bot/bot.telegram.controller";
import { Router } from "express";
export const botTelegramRouter = Router();




// telegram group
botTelegramRouter.get("/group/info", sendGroupinfo)
botTelegramRouter.get("/group/topic/info/get", sendGroupTopicinfo)
botTelegramRouter.get("/validchatids", sendValidchatids)
botTelegramRouter.get("/isgroupjoinable", isGroupJoinable)
botTelegramRouter.get("/getusersdata", AllUserData)
