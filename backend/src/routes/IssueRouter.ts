import { Router } from "express";
import { isAdmin } from "../../lib/auth";
import { CloseIssue, createNewIssue, getAllIssue, getIssueByid, Isprocessed_issue, RemoveIssue, setDownVote, setPriorityVote, setupVote, update_issue, updateStatus } from "../controllers/issue.controller";
export const IssueRouter = Router();


/* 
all - > get all open issue
/:id -> get issue where id == id 
/create -> create a new issue
/update/:id -> update issue
/isporcessed -> is admin processed

// admin //
/delete/:id -> all set then admin can delete this issue 

// user //
/priorityVote -> it increase priority of this issue so admin get it fist and process quickly
/voteplus -> add user vote on issue -> have a vote section where user can vote , it sotre user id (only user can vote only one time )
/voteminus -> remove vote on issue  -> have a vote section where user can vote , it sotre user id (only user can vote only one time )
/close/:id -> close an open issue 

*/


IssueRouter.get("/all", getAllIssue)
IssueRouter.get("/getbyid", getIssueByid)
IssueRouter.post("/create", createNewIssue)
IssueRouter.put("/update", update_issue)
IssueRouter.get("/isprocessed", Isprocessed_issue)

// user
IssueRouter.post("/priorityVote", setPriorityVote)
IssueRouter.post("/upvote", setupVote)
IssueRouter.post("/downvote", setDownVote)
IssueRouter.post("/close", CloseIssue)



// admin
IssueRouter.post("/delete",isAdmin ,RemoveIssue)
IssueRouter.post("/updatestatus",isAdmin ,updateStatus)



