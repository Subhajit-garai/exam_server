import { Router } from "express";
import { userSignin, userSignup,userForgotpasswordTokenGen,userForgotpasswordTokenVerify, useremailValidationTokengen, useremailValidationTokenVerify } from "../controllers/user.controller";
import { otpLimiter, passwordResetLimiter, signinLimiter } from "../../lib/ratelimiter";
import { IsrazerpayTestAccessOpen, IsUserLoginOpen, IsUserSignUpOpen } from "../../lib/Security";

export const CommonuserRoutes = Router();

CommonuserRoutes.post("/signup",signinLimiter, IsUserSignUpOpen ,userSignup);

CommonuserRoutes.post("/signin",signinLimiter,IsrazerpayTestAccessOpen,IsUserLoginOpen , userSignin);

CommonuserRoutes.post("/validate/email",otpLimiter, useremailValidationTokengen);
CommonuserRoutes.post("/verify/email",otpLimiter, useremailValidationTokenVerify);



CommonuserRoutes.post("/forgotpassword",passwordResetLimiter, userForgotpasswordTokenGen);
CommonuserRoutes.post("/forgotpassword/verify",otpLimiter, userForgotpasswordTokenVerify);

// forget password
