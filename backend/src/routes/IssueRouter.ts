import { Router } from "express";
import { isAdmin } from "@repo/lib/security/auth.js";
import { CloseIssue, createNewIssue, getAllIssue, getIssueByid, Isprocessed_issue, RemoveIssue, setDownVote, setPriorityVote, setupVote, update_issue, updateStatus, GetquestionIssuecount } from "../controllers/issue.controller.js";
export const IssueAdminRouter = Router();
export const IssuePublicRouter = Router();

// Public Routes
IssuePublicRouter.get("/all", getAllIssue)
IssuePublicRouter.get("/getbyid", getIssueByid)
IssuePublicRouter.post("/create", createNewIssue)
IssuePublicRouter.put("/update", update_issue)
IssuePublicRouter.get("/isprocessed", Isprocessed_issue)
IssuePublicRouter.get("/getquestionIssuecount", GetquestionIssuecount)

// user
IssuePublicRouter.post("/priorityVote", setPriorityVote)
IssuePublicRouter.post("/upvote", setupVote)
IssuePublicRouter.post("/downvote", setDownVote)
IssuePublicRouter.post("/close", CloseIssue)

// admin
IssueAdminRouter.post("/delete", isAdmin, RemoveIssue)
IssueAdminRouter.post("/updatestatus", isAdmin, updateStatus)



