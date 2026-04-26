import { Router } from "express";
import { isAdmin } from "@repo/lib/security/auth.js";
import { RemoveIssue, updateStatus } from "../../controllers/issue.controller.js";

export const IssueAdminRouter = Router();

// admin
IssueAdminRouter.post("/delete", isAdmin, RemoveIssue)
IssueAdminRouter.post("/updatestatus", isAdmin, updateStatus)
