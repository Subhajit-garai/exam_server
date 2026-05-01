import { Router } from "express";
import { userSignin, userSignup, generateUserForgotPasswordToken, verifyUserForgotPasswordToken, generateEmailValidationToken, verifyUserEmailValidationToken } from "../controllers/user.controller.js";
import { otpLimiter, passwordResetLimiter, signinLimiter } from "@repo/lib/security/ratelimiter.js";
import { IsRazorpayTestAccessOpen, IsUserLoginOpen, IsUserSignUpOpen } from "@repo/lib/security/Security.js";


export const CommonuserRoutes = Router();

CommonuserRoutes.post("/signup", signinLimiter, IsUserSignUpOpen, userSignup);
CommonuserRoutes.post("/signin", signinLimiter, IsRazorpayTestAccessOpen, IsUserLoginOpen, userSignin);
CommonuserRoutes.post("/validate/email", otpLimiter, generateEmailValidationToken); // tempory stop verify ing emails
CommonuserRoutes.post("/verify/email", otpLimiter, verifyUserEmailValidationToken);
CommonuserRoutes.post("/forgotpassword", passwordResetLimiter, generateUserForgotPasswordToken);
CommonuserRoutes.post("/forgotpassword/verify", otpLimiter, verifyUserForgotPasswordToken);

// forget password
