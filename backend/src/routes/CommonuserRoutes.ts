import { Router } from "express";
import { userSignin, userSignup,userForgotpasswordTokenGen,userForgotpasswordTokenVerify } from "../controllers/user.controller";
import { otpLimiter, passwordResetLimiter, signinLimiter } from "../../lib/ratelimiter";
import { IsUserLoginOpen, IsUserSignUpOpen } from "../../lib/Security";

export const CommonuserRoutes = Router();

CommonuserRoutes.post("/signup",signinLimiter, IsUserSignUpOpen ,userSignup);

CommonuserRoutes.post("/signin",signinLimiter,IsUserLoginOpen, userSignin);


CommonuserRoutes.post("/forgotpassword",passwordResetLimiter, userForgotpasswordTokenGen);
CommonuserRoutes.post("/forgotpassword/verify",otpLimiter, userForgotpasswordTokenVerify);

// forget password
