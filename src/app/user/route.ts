import { Router } from "express";
import {
  auth,
  Logout,
  userPurchases,
  generateUserTelegramIdValidationToken,
  verifyUserTelegramIdValidationToken,
  updateUser,
  getUserTimeline,
  getSubscriptionTiers,
  getUserSubscriptionDetails,
  userSignin,
  userSignup,
  generateUserForgotPasswordToken,
  verifyUserForgotPasswordToken,
  generateEmailValidationToken,
  verifyUserEmailValidationToken,
} from "./controller.js";
import { getUserRewards } from "../activity/controller.js";
import {
  otpLimiter,
  passwordResetLimiter,
  signinLimiter,
} from "@/lib/security/ratelimiter.js";
import {
  IsRazorpayTestAccessOpen,
  IsUserLoginOpen,
  IsUserSignUpOpen,
} from "@/lib/security/Security.js";
import { activityRouter } from "../activity/route.js";
import { profileRouter } from "../profile/route.js";
import { genToken } from "@/utils/token.js";
import { getAllNoteSubjectForUser } from "../note/controller.js";

export const userRouter = Router();

export const CommonuserRoutes = Router();

CommonuserRoutes.post("/signup", signinLimiter, IsUserSignUpOpen, userSignup);
CommonuserRoutes.post(
  "/signin",
  signinLimiter,
  IsRazorpayTestAccessOpen,
  IsUserLoginOpen,
  userSignin,
);
CommonuserRoutes.post(
  "/validate/email",
  otpLimiter,
  generateEmailValidationToken,
);
CommonuserRoutes.post(
  "/verify/email",
  otpLimiter,
  verifyUserEmailValidationToken,
);
CommonuserRoutes.post(
  "/forgotpassword",
  passwordResetLimiter,
  generateUserForgotPasswordToken,
);
CommonuserRoutes.post(
  "/forgotpassword/verify",
  otpLimiter,
  verifyUserForgotPasswordToken,
);

userRouter.get("/auth", IsUserLoginOpen, auth);
userRouter.get("/ws-token", IsUserLoginOpen, (req: any, res: any) => {
  const token = genToken(req.user, "1h", "ws");
  res.json({ wsToken: token, success: true });
});
userRouter.get("/logout", Logout);
// notes
userRouter.get("/notes/subject/all", getAllNoteSubjectForUser);

userRouter.post(
  "/validate/telegramid",
  otpLimiter,
  generateUserTelegramIdValidationToken,
);
userRouter.post(
  "/verify/telegramid",
  otpLimiter,
  verifyUserTelegramIdValidationToken,
);
//purchases
userRouter.get("/purchases", userPurchases);
userRouter.get("/timeline", getUserTimeline);
userRouter.get("/subscription/tiers", getUserSubscriptionDetails);
userRouter.get("/rewards", getUserRewards);

userRouter.use("/activity", activityRouter);
userRouter.use("/profile", profileRouter);
