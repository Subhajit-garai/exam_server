import { Router } from "express";
import { auth, Logout, useremailValidationTokengen, useremailValidationTokenVerify, userPurchases, usertelegramidValidationTokengen, usertetegramidValidationTokenVerify } from "../controllers/user.controller";
import { checkout, paymentVerification } from "../controllers/payment.controller";
import { otpLimiter, passwordResetLimiter } from "../../lib/ratelimiter";
import { IsPurchasesOpen,IsUserLoginOpen } from "../../lib/Security";

export const userRouter = Router();

userRouter.get("/auth",IsUserLoginOpen, auth);
userRouter.get("/logout", Logout);

userRouter.get("/payment/getkey",IsPurchasesOpen, (req: any, res: any) =>
  res.status(200).json({ key: process.env.RAZERPAY_API_KEY })
);

userRouter.post("/payment/Checkout",IsPurchasesOpen, checkout);
// userRouter.post("/payment/paymentverification", paymentVerification);`

userRouter.get("/profile", (req, res) => {
  res.json({ status: "success", data: "user profile data" });
});


userRouter.post("/validate/email",otpLimiter, useremailValidationTokengen);
userRouter.post("/verify/email",otpLimiter, useremailValidationTokenVerify);

userRouter.post("/validate/telegramid",otpLimiter, usertelegramidValidationTokengen );
userRouter.post("/verify/telegramid",otpLimiter, usertetegramidValidationTokenVerify);

//purchases 
userRouter.get("/purchases",userPurchases);

