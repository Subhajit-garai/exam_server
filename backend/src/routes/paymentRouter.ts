import { Router } from "express";
import { paymentVerification } from "../controllers/payment.controller";

export const paymentRouter = Router();

paymentRouter.post("/paymentverification", paymentVerification);

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

// for rate limiting

// import rateLimit from "express-rate-limit";

// const paymentLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 10, // Limit each IP to 10 requests per windowMs
// });

// app.post("/verify-payment", paymentLimiter, (req, res) => {
//   // Payment verification logic
// });
