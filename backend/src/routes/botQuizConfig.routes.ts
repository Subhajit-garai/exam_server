import { Router } from "express";
import { getAllUserBotQuizConfigs, getUserBotQuizConfig, createBotQuizConfig, updateBotQuizConfig, deleteBotQuizConfig, getBotQuizConfig, getAllBotQuizConfigs } from "../controllers/bot/botQuizConfig.controller.js";


export const botQuizConfigAdminRouter = Router();

botQuizConfigAdminRouter.post("/", createBotQuizConfig);
botQuizConfigAdminRouter.put("/:id", updateBotQuizConfig);
botQuizConfigAdminRouter.delete("/:id", deleteBotQuizConfig);
botQuizConfigAdminRouter.get("/:id", getBotQuizConfig);
botQuizConfigAdminRouter.get("/", getAllBotQuizConfigs);



export const botQuizConfigUserRouter = Router();

botQuizConfigUserRouter.get("/", getAllUserBotQuizConfigs);
botQuizConfigUserRouter.get("/:id", getUserBotQuizConfig);

