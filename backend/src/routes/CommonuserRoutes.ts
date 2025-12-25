import { Router } from "express";
import { userSignin, userSignup, userForgotpasswordTokenGen, userForgotpasswordTokenVerify, useremailValidationTokengen, useremailValidationTokenVerify } from "../controllers/user.controller.js";
import { otpLimiter, passwordResetLimiter, signinLimiter } from "@repo/lib/security/ratelimiter.js";
import { IsRazorpayTestAccessOpen, IsUserLoginOpen, IsUserSignUpOpen } from "@repo/lib/security/Security.js";


export const CommonuserRoutes = Router();

CommonuserRoutes.post("/signup", signinLimiter, IsUserSignUpOpen, userSignup);
CommonuserRoutes.post("/signin", signinLimiter, IsRazorpayTestAccessOpen, IsUserLoginOpen, userSignin);
CommonuserRoutes.post("/validate/email", otpLimiter, useremailValidationTokengen);
CommonuserRoutes.post("/verify/email", otpLimiter, useremailValidationTokenVerify);
CommonuserRoutes.post("/forgotpassword", passwordResetLimiter, userForgotpasswordTokenGen);
CommonuserRoutes.post("/forgotpassword/verify", otpLimiter, userForgotpasswordTokenVerify);

// forget password
