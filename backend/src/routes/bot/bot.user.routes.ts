import { Router } from "express";
import { getUserdata, setUserProgress } from "@/controllers/bot.controller.js";
import { getUserScore, setUserScore } from "@/controllers/bot/bot.score.controller.js";
import { getUserans, SetUserans } from "@/controllers/bot/bot.ans.controller.js";
import { IsprimeUser, sendAlluser } from "@/controllers/bot/bot.telegram.controller.js";

export const botUserRouter = Router();



// user
botUserRouter.get("/info/:id", getUserdata);
botUserRouter.post("/progress/set", setUserProgress);
botUserRouter.post("/score/set", setUserScore);
botUserRouter.get("/score/get", getUserScore);
botUserRouter.post("/ans/set", SetUserans);
botUserRouter.get("/ans/get", getUserans);

botUserRouter.get("/isprimeuser", IsprimeUser)
botUserRouter.get("/allusers", sendAlluser) // -- > can be remove 