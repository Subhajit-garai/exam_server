import { Router } from "express";
import { SendAppConfig, getAllbotUser, updateAppConfig } from "./controller.js";

export const settingsRouter = Router();

settingsRouter.get("/config", SendAppConfig);
settingsRouter.get("/bot-users", getAllbotUser);
settingsRouter.put("/config", updateAppConfig);
