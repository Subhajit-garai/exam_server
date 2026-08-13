import { getPlatformStats } from "../metrix/controller.js";
import { getSubcriptionAndOfferFormated } from "../payment/controller.js";
import { Router } from "express";

export const statsRouter = Router();

statsRouter.get("/offersubcriptions", getSubcriptionAndOfferFormated);
statsRouter.get("/stats", getPlatformStats);
