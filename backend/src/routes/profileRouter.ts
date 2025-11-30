import { Router } from "express";
import { getProfile, updateAcademicProfile, updateSocialLinks } from "../controllers/profile.controller.js";

export const profileRouter = Router();

profileRouter.get("/", getProfile);
profileRouter.put("/academic/update", updateAcademicProfile);
profileRouter.put("/social/update", updateSocialLinks);
