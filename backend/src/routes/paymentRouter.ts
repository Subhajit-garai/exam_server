import { Router } from "express";
import { checkout, checkoutSubcription, getSubcriptionAndOffer, paymentVerification } from "../controllers/payment.controller";
import { IsPurchasesOpen } from "../../lib/Security";

export const paymentRouter = Router();


paymentRouter.get("/getkey",IsPurchasesOpen, (req: any, res: any) =>
  res.status(200).json({ key: process.env.RAZERPAY_API_KEY })
);
paymentRouter.get("/offer" , getSubcriptionAndOffer)
paymentRouter.post("/Checkout",IsPurchasesOpen, checkout);
paymentRouter.post("/subscriptioncheckout",IsPurchasesOpen, checkoutSubcription);

const allowedIPs = [
  "52.66.75.174",
  "52.66.76.63	",
  "52.66.151.218",
  "35.154.217.40",
  "35.154.22.73",
  "35.154.143.15",
  "13.126.199.247",
  "13.126.238.192",
  "13.232.194.134",
  "18.96.225.0/26",
  "18.99.161.0/26",
];

function checkIP(req: any, res: any, next: () => any) {
  const clientIP = req.ip || req.connection.remoteAddress;
  if (allowedIPs.includes(clientIP)) {
    next(); // Proceed if IP is allowed
  } else {
    res.status(403).json({ success: false, message: "Unauthorized IP" });
  }
}

