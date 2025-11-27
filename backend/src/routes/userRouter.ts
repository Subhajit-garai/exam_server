import { Router } from "express";
import { auth, Logout, userPurchases, usertelegramidValidationTokengen, usertetegramidValidationTokenVerify } from "../controllers/user.controller.js";
import { otpLimiter } from "@repo/lib/security/ratelimiter.js";
import { IsUserLoginOpen } from "@repo/lib/security/Security.js";
import { recentActivityRouter } from "./recentActivity.routes.js";

export const userRouter = Router();

userRouter.get("/auth", IsUserLoginOpen, auth);
userRouter.get("/logout", Logout);


// userRouter.post("/payment/paymentverification", paymentVerification);`

userRouter.get("/profile", (req, res) => {
  res.json({ status: "success", data: "user profile data" });
});


userRouter.post("/validate/telegramid", otpLimiter, usertelegramidValidationTokengen);
userRouter.post("/verify/telegramid", otpLimiter, usertetegramidValidationTokenVerify);

//purchases 
userRouter.get("/purchases", userPurchases);


// recentactivity router
userRouter.use("/recentactivity", recentActivityRouter);
