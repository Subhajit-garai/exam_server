import { Router } from "express";
import { auth, Logout , userPurchases, usertelegramidValidationTokengen, usertetegramidValidationTokenVerify } from "../controllers/user.controller";
import { otpLimiter } from "../../lib/ratelimiter";
import { IsUserLoginOpen } from "../../lib/Security";

export const userRouter = Router();

userRouter.get("/auth",IsUserLoginOpen, auth);
userRouter.get("/logout", Logout);


// userRouter.post("/payment/paymentverification", paymentVerification);`

userRouter.get("/profile", (req, res) => {
  res.json({ status: "success", data: "user profile data" });
});



userRouter.post("/validate/telegramid",otpLimiter, usertelegramidValidationTokengen );
userRouter.post("/verify/telegramid",otpLimiter, usertetegramidValidationTokenVerify);

//purchases 
userRouter.get("/purchases",userPurchases);

