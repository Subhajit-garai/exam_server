import { getPlatformStats } from "@/controllers/metrix.controller.js";
import { getSubcriptionAndOfferFormated } from "@/controllers/payment.controller.js";
import { Router } from "express";
export const statsRouter = Router();

statsRouter.get("/offersubcriptions", getSubcriptionAndOfferFormated);
statsRouter.get("/stats", getPlatformStats);
