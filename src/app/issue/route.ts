import { Router } from "express";
import {
  CloseIssue,
  createNewIssue,
  getAllIssue,
  getIssueByid,
  Isprocessed_issue,
  setDownVote,
  setPriorityVote,
  setupVote,
  update_issue,
  GetquestionIssuecount,
  RemoveIssue,
  updateStatus,
} from "./controller.js";
import { isAdmin } from "@repo/lib/security/auth.js";

export const IssuePublicRouter = Router();
export const IssueAdminRouter = Router();

// Public Routes
IssuePublicRouter.get("/all", getAllIssue);
IssuePublicRouter.get("/getbyid", getIssueByid);
IssuePublicRouter.post("/create", createNewIssue);
IssuePublicRouter.put("/update", update_issue);
IssuePublicRouter.get("/isprocessed", Isprocessed_issue);
IssuePublicRouter.get("/getquestionIssuecount", GetquestionIssuecount);

// User Routes
IssuePublicRouter.post("/priorityVote", setPriorityVote);
IssuePublicRouter.post("/upvote", setupVote);
IssuePublicRouter.post("/downvote", setDownVote);
IssuePublicRouter.post("/close", CloseIssue);

// Admin Routes
IssueAdminRouter.post("/delete", isAdmin, RemoveIssue);
IssueAdminRouter.post("/updatestatus", isAdmin, updateStatus);
