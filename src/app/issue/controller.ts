import zod from "zod";
import { IssueInpute_zod_type } from "@/zod/issue.zod.js";
import { IssueService } from "./service.js";
import { Status } from "@/db/schema/enums.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { ZodDataSafeParse } from "@/utils/ZodTypeChecker.js";
import { CustomError } from "@/middleware/globalErrorHandler.js";
import { logger } from "@/utils/logger.js";

const issueService = new IssueService();

export const test = asyncHandler(async (req: any, res: any) => {
  res.json({ success: true, message: "message", data: "data" });
});

export const GetquestionIssuecount = asyncHandler(
  async (req: any, res: any) => {
    let data = zod.string().safeParse(req.query.id);
    if (!data.success) {
      throw ZodDataSafeParse(data);
    }
    let id = data.data;

    let response = await issueService.getQuestionIssueCount(id);

    res.json({
      success: true,
      message: " total questionIssuecount",
      data: response,
    });
  },
);

export const RemoveIssue = asyncHandler(async (req: any, res: any) => {
  let data = zod.string().safeParse(req.query.id);
  if (!data.success) {
    throw ZodDataSafeParse(data);
  }
  let id = data.data;

  let response = await issueService.deleteIssue(id);

  res.json({ success: true, message: "issue deleted", data: response });
});

export const updateStatus = asyncHandler(async (req: any, res: any) => {
  let data = zod
    .object({
      id: zod.string(),
      status: zod.enum(Status.enumValues),
    })
    .safeParse(req.body);

  if (!data.success) {
    throw ZodDataSafeParse(data);
  }
  let { id, status } = data.data;

  let response = await issueService.updateStatus(id, status);

  res.json({ success: true, message: "message", data: response });
});

export const CloseIssue = asyncHandler(async (req: any, res: any) => {
  let data = zod.string().safeParse(req.query.id);
  if (!data.success) {
    throw ZodDataSafeParse(data);
  }
  let id = data.data;

  let response = await issueService.closeIssue(id);

  res.json({ success: true, message: "message", data: response });
});

export const setDownVote = asyncHandler(async (req: any, res: any) => {
  let data = zod.string().safeParse(req.query.id);
  if (!data.success) {
    throw ZodDataSafeParse(data);
  }
  let id = data.data;

  let response = await issueService.voteIssue(id, "down");

  res.json({ success: true, message: "voted ", data: response });
});

export const setupVote = asyncHandler(async (req: any, res: any) => {
  let data = zod.string().safeParse(req.query.id);
  if (!data.success) {
    throw ZodDataSafeParse(data);
  }
  let id = data.data;

  let response = await issueService.voteIssue(id, "up");

  res.json({ success: true, message: "voted ", data: response });
});

export const setPriorityVote = asyncHandler(async (req: any, res: any) => {
  let data = zod.string().safeParse(req.query.id);
  if (!data.success) {
    throw ZodDataSafeParse(data);
  }
  let id = data.data;

  let response = await issueService.voteIssue(id, "priority");

  res.json({ success: true, message: "voted ", data: response });
});

export const Isprocessed_issue = asyncHandler(async (req: any, res: any) => {
  let data = zod.string().safeParse(req.query.id);
  if (!data.success) {
    throw ZodDataSafeParse(data);
  }
  let id = data.data;

  logger.debug("update_issue id:", id);
  let response = await issueService.getIssueById(id);

  if (!response) {
    throw new CustomError("Issue not found", 404);
  }

  res.json({ success: true, message: "message", data: response });
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

  let response = await issueService.updateIssue(
    id,
    newData.data,
    req.user,
    req.userRole,
  );

  if (!response) {
    throw new CustomError("Issue not updated", 404);
  }

  res.json({ success: true, message: "message", data: response });
});

export const createNewIssue = asyncHandler(async (req: any, res: any) => {
  let data = IssueInpute_zod_type.safeParse(req.body);

  if (!data.success) {
    throw ZodDataSafeParse(data);
  }

  let response = await issueService.createIssue(
    data.data,
    req.user,
    req.userRole,
  );

  res.json({ success: true, message: "message", data: response });
});

export const getIssueByid = asyncHandler(async (req: any, res: any) => {
  let data = zod.string().safeParse(req.query.id);
  if (!data.success) {
    throw ZodDataSafeParse(data);
  }

  let id = data.data;

  logger.debug("getIssueByid id:", id);

  let response = await issueService.getIssueById(id);

  if (!response) {
    throw new CustomError("Issue not found", 404);
  }

  res.json({ success: true, message: "issue found", data: response });
});

export const getAllIssue = asyncHandler(async (req: any, res: any) => {
  let getAllIssues = await issueService.getAllIssues();
  res.json({ success: true, message: "message", data: getAllIssues });
});
