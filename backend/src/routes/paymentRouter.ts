import { Router } from "express";
import { checkoutToken, checkoutSubcription, getSubcriptionAndOffer, ApplyCupone } from "../controllers/payment.controller.js";
import { IsPurchasesOpen, IsCouponOpen } from "@repo/lib/security/Security.js";

export const paymentRouter = Router();


paymentRouter.get("/getkey", IsPurchasesOpen, (req: any, res: any) =>
  res.status(200).json({ key: process.env.RAZERPAY_API_KEY })
);
paymentRouter.get("/offer", getSubcriptionAndOffer)
paymentRouter.post("/checkout/tocken", IsPurchasesOpen, checkoutToken);
paymentRouter.post("/checkout/subscription", IsPurchasesOpen, checkoutSubcription);
paymentRouter.post("/apply-coupon", IsPurchasesOpen, IsCouponOpen, ApplyCupone);