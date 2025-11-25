import { Router } from "express";
import { checkoutToken, checkoutSubcription,getSubcriptionAndOffer } from "../controllers/payment.controller";
import { IsPurchasesOpen } from "@repo/lib/security/Security";

export const paymentRouter = Router();


paymentRouter.get("/getkey",IsPurchasesOpen, (req: any, res: any) =>
  res.status(200).json({ key: process.env.RAZERPAY_API_KEY })
);
paymentRouter.get("/offer", getSubcriptionAndOffer)
paymentRouter.post("/tockenCheckout",IsPurchasesOpen, checkoutToken);
paymentRouter.post("/subscriptionCheckout",IsPurchasesOpen, checkoutSubcription);



