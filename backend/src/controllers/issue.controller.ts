import zod from "zod";
import { IssueInpute_zod_type } from "../zod/issue.zod.js";
import { Status } from "@repo/prisma/client.js";
import { IssueService } from "../services/issue.service.js";
import { logger } from "@repo/lib/helper/logger.js";
import { asyncHandler } from "@repo/lib/helper/asyncHandler.js";
import { ZodDataSafeParse } from "@repo/lib/ZodTypeChecker.js";
import { CustomError } from "@/middleware/globalErrorHandler.js";



const issueService = new IssueService();

export const test = asyncHandler(async (req: any, res: any) => {
  res.json({ success: true, message: "message", data: "data" });
});


export const GetquestionIssuecount = asyncHandler(async (req: any, res: any) => {
  let data = zod.string().safeParse(req.query.id);
  if (!data.success) {
    throw ZodDataSafeParse(data);
  }
  let id = data.data;

  let responce = await issueService.getQuestionIssueCount(id);

  res.json({ success: true, message: " total questionIssuecount", data: responce });
});


export const RemoveIssue = asyncHandler(async (req: any, res: any) => {
  let data = zod.string().safeParse(req.query.id);
  if (!data.success) {
    throw ZodDataSafeParse(data);
  }
  let id = data.data;

  let responce = await issueService.deleteIssue(id);

  res.json({ success: true, message: "issue deleted", data: responce });
});


export const updateStatus = asyncHandler(async (req: any, res: any) => {
  let data = zod
    .object({
      id: zod.string(),
      status: zod.nativeEnum(Status),
    })
    .safeParse(req.body);

  if (!data.success) {
    throw ZodDataSafeParse(data);
  }
  let { id, status } = data.data;

  let responce = await issueService.updateStatus(id, status);

  res.json({ success: true, message: "message", data: responce });
});


export const CloseIssue = asyncHandler(async (req: any, res: any) => {
  let data = zod.string().safeParse(req.query.id);
  if (!data.success) {
    throw ZodDataSafeParse(data);
  }
  let id = data.data;

  let responce = await issueService.closeIssue(id);

  res.json({ success: true, message: "message", data: responce });
});


export const setDownVote = asyncHandler(async (req: any, res: any) => {
  let data = zod.string().safeParse(req.query.id);
  if (!data.success) {
    throw ZodDataSafeParse(data);
  }
  let id = data.data;

  let responce = await issueService.voteIssue(id, "down");

  res.json({ success: true, message: "voted ", data: responce });
});


export const setupVote = asyncHandler(async (req: any, res: any) => {
  let data = zod.string().safeParse(req.query.id);
  if (!data.success) {
    throw ZodDataSafeParse(data);
  }
  let id = data.data;

  let responce = await issueService.voteIssue(id, "up");

  res.json({ success: true, message: "voted ", data: responce });
});


export const setPriorityVote = asyncHandler(async (req: any, res: any) => {
  let data = zod.string().safeParse(req.query.id);
  if (!data.success) {
    throw ZodDataSafeParse(data);
  }
  let id = data.data;

  let responce = await issueService.voteIssue(id, "priority");

  res.json({ success: true, message: "voted ", data: responce });
});


export const Isprocessed_issue = asyncHandler(async (req: any, res: any) => {
  let data = zod.string().safeParse(req.query.id);
  if (!data.success) {
    throw ZodDataSafeParse(data);
  }
  let id = data.data;

  logger.debug("update_issue id:", id);
  let responce = await issueService.getIssueById(id);

  if (!responce) {
    throw new CustomError("Issue not found", 404);
  }

  res.json({ success: true, message: "message", data: responce });
});


export const update_issue = asyncHandler(async (req: any, res: any) => {
  let data = zod.string().safeParse(req.query.id);
  if (!data.success) {
    throw ZodDataSafeParse(data);
  }
  let id = data.data;

  logger.debug("update_issue id:", id);

  let newData = IssueInpute_zod_type.safeParse(req.body);

  if (!newData.success) {
    throw ZodDataSafeParse(newData);
  }

  let responce = await issueService.updateIssue(id, newData.data, req.user, req.userRole);

  if (!responce) {
    throw new CustomError("Issue not updated", 404);
  }

  res.json({ success: true, message: "message", data: responce });
});


export const createNewIssue = asyncHandler(async (req: any, res: any) => {
  let data = IssueInpute_zod_type.safeParse(req.body);

  if (!data.success) {
    throw ZodDataSafeParse(data);
  }

  let responce = await issueService.createIssue(data.data, req.user, req.userRole);

  res.json({ success: true, message: "message", data: responce });
});


export const getIssueByid = asyncHandler(async (req: any, res: any) => {
  let data = zod.string().safeParse(req.query.id);
  if (!data.success) {
    throw ZodDataSafeParse(data);
  }

  let id = data.data;

  logger.debug("getIssueByid id:", id);

  let responce = await issueService.getIssueById(id);

  if (!responce) {
    throw new CustomError("Issue not found", 404);
  }

  res.json({ success: true, message: "issue found", data: responce });
});


export const getAllIssue = asyncHandler(async (req: any, res: any) => {
  let getAllIssues = await issueService.getAllIssues();
  res.json({ success: true, message: "message", data: getAllIssues });
});

