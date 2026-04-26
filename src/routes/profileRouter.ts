import { Router } from "express";
import { deleteSocialLinksRecord, getProfile, updateAcademicProfile, updateSocialLinks } from "../controllers/profile.controller.js";

export const profileRouter = Router();

profileRouter.get("/", getProfile);
profileRouter.put("/academic/update", updateAcademicProfile);


profileRouter.put("/sociallinks", updateSocialLinks);
profileRouter.delete("/sociallinks/:platform", deleteSocialLinksRecord);
