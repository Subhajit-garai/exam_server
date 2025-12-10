import { Router } from "express";
import { auth, Logout, userPurchases, usertelegramidValidationTokengen, usertetegramidValidationTokenVerify, updateUser, getUserTimeline, getSubscriptionTiers, getUserSubscriptionDetails } from "../controllers/user.controller.js";
import { getUserRewards } from "../controllers/activity.controller.js";
import { otpLimiter } from "@repo/lib/security/ratelimiter.js";
import { IsUserLoginOpen } from "@repo/lib/security/Security.js";
import { activityRouter } from "./activity.routes.js";
import { profileRouter } from "./profileRouter.js";
import { genToken } from "@/lib/token.js";
import { getAllNoteSubjectForUser } from "@/controllers/note.controller.js";


export const userRouter = Router();

userRouter.get("/auth", IsUserLoginOpen, auth);
userRouter.get("/ws-token", IsUserLoginOpen, (req: any, res: any) => {
    const token = genToken(req.user, '1h', "ws")
    res.json({ wsToken: token, success: true });
});
userRouter.get("/logout", Logout);
// notes 
userRouter.get("/notes/allsubject", getAllNoteSubjectForUser)
userRouter.post("/validate/telegramid", otpLimiter, usertelegramidValidationTokengen);
userRouter.post("/verify/telegramid", otpLimiter, usertetegramidValidationTokenVerify);
//purchases 
userRouter.get("/purchases", userPurchases);
userRouter.use("/activity", activityRouter)
// timeline get 
userRouter.get("/timeline", getUserTimeline);
userRouter.use("/profile", profileRouter);
userRouter.get("/subscription/tiers", getUserSubscriptionDetails);
userRouter.get("/rewards", getUserRewards);
