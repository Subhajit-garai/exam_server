import zod from "zod";
import { IssueInpute_zod_type } from "../zod/issue.zod.js";
import { Status } from "@repo/prisma/client.js";
import { IssueService } from "../services/issue.service.js";

const issueService = new IssueService();

export const test = async (req: any, res: any) => {
  try {
    res.json({ success: true, message: "message", data: "data" });
  } catch (error) {
    console.log("Error in updateStatus in issue  --->", error);
  }
};

export const GetquestionIssuecount = async (req: any, res: any) => {
  try {
    let data = zod.string().safeParse(req.query.id);
    if (!data.success) {
      return res.status(404).json({
        success: false,
        message: "Invalid inputs",
      });
    }
    let id = data.data;

    let responce = await issueService.getQuestionIssueCount(id);

    if (!responce) {
      // Note: count returns 0 if no matches, which is falsy in JS if we treat it as boolean, but here it's a number. 
      // However, the original code checked !responce. 0 is falsy. 
      // But count usually returns a number >= 0. 
      // If it returns 0, it means no issues found. 
      // I will keep the logic as close to original as possible, but count returning 0 is valid.
      // Original code: if (!responce) ...
      // If count is 0, it enters the block. 
      // I'll assume the original intent was to check if the query failed, but prisma count doesn't return null/undefined on success.
      // I will return the response directly.
    }

    res.json({ success: true, message: " total questionIssuecount", data: responce });
  } catch (error) {
    console.log("Error in GetquestionIssuecount in issue --->", error);
  }
};

export const RemoveIssue = async (req: any, res: any) => {
  try {
    let data = zod.string().safeParse(req.query.id);
    if (!data.success) {
      return res.status(404).json({
        success: false,
        message: "Invalid inputs",
      });
    }
    let id = data.data;

    let responce = await issueService.deleteIssue(id);

    res.json({ success: true, message: "issue deleted", data: responce });

  } catch (error) {
    console.log("Error in RemoveIssue in issue --->", error);
    res.status(500).json({ success: false, message: "Error deleting issue" });
  }
};

export const updateStatus = async (req: any, res: any) => {
  try {
    let data = zod
      .object({
        id: zod.string(),
        status: zod.nativeEnum(Status),
      })
      .safeParse(req.body);

    if (!data.success) {
      return res.status(404).json({
        success: false,
        message: "Invalid inputs",
      });
    }
    let { id, status } = data.data;

    let responce = await issueService.updateStatus(id, status);

    res.json({ success: true, message: "message", data: responce });
  } catch (error) {
    console.log("Error in updateStatus in issue --->", error);
  }
};

export const CloseIssue = async (req: any, res: any) => {
  try {
    let data = zod.string().safeParse(req.query.id);
    if (!data.success) {
      return res.status(404).json({
        success: false,
        message: "Invalid inputs",
      });
    }
    let id = data.data;

    let responce = await issueService.closeIssue(id);

    res.json({ success: true, message: "message", data: responce });
  } catch (error) {
    console.log("Error in CloseIssue in issue  --->", error);
  }
};

export const setDownVote = async (req: any, res: any) => {
  try {
    let data = zod.string().safeParse(req.query.id);
    if (!data.success) {
      return res.status(404).json({
        success: false,
        message: "Invalid inputs",
      });
    }
    let id = data.data;

    let responce = await issueService.voteIssue(id, "down");

    res.json({ success: true, message: "voted ", data: responce });
  } catch (error) {
    console.log("Error in SetDownVote in issue  --->", error);
  }
};

export const setupVote = async (req: any, res: any) => {
  try {
    let data = zod.string().safeParse(req.query.id);
    if (!data.success) {
      return res.status(404).json({
        success: false,
        message: "Invalid inputs",
      });
    }
    let id = data.data;

    let responce = await issueService.voteIssue(id, "up");

    res.json({ success: true, message: "voted ", data: responce });
  } catch (error) {
    console.log("Error in setUpVote in issue  --->", error);
  }
};

export const setPriorityVote = async (req: any, res: any) => {
  try {
    let data = zod.string().safeParse(req.query.id);
    if (!data.success) {
      return res.status(404).json({
        success: false,
        message: "Invalid inputs",
      });
    }
    let id = data.data;

    let responce = await issueService.voteIssue(id, "priority");

    res.json({ success: true, message: "voted ", data: responce });
  } catch (error) {
    console.log("Error in SetPriority in issue  --->", error);
  }
};

export const Isprocessed_issue = async (req: any, res: any) => {
  try {
    let data = zod.string().safeParse(req.query.id);
    if (!data.success) {
      return res.status(404).json({
        success: false,
        message: "Invalid inputs",
      });
    }
    let id = data.data;

    console.log("update_issue's id is ", id);
    let responce = await issueService.getIssueById(id);

    res.json({ success: true, message: "message", data: responce });
  } catch (error) {
    console.log("Error in Isprocessed_issue in issue  --->", error);
    res.status(404).json({ success: false, message: "issue not found" });
  }
};

export const update_issue = async (req: any, res: any) => {
  try {
    let data = zod.string().safeParse(req.query.id);
    if (!data.success) {
      return res.status(404).json({
        success: false,
        message: "Invalid inputs",
      });
    }
    let id = data.data;

    console.log("update_issue's id is ", id);

    let newData = IssueInpute_zod_type.safeParse(req.body);

    if (!newData.success) {
      return res.status(404).json({
        success: false,
        message: "Invalid inputs",
      });
    }

    let responce = await issueService.updateIssue(id, newData.data, req.user, req.userRole);

    res.json({ success: true, message: "message", data: responce });
  } catch (error) {
    console.log("Error in update_issue in issue  --->", error);
    res.status(404).json({ success: false, message: "issue not found" });
  }
};

export const createNewIssue = async (req: any, res: any) => {
  try {
    let data = IssueInpute_zod_type.safeParse(req.body);

    if (!data.success) {
      return res.status(404).json({
        success: false,
        message: "Invalid inputs, issue not created",
      });
    }

    let responce = await issueService.createIssue(data.data, req.user, req.userRole);

    res.json({ success: true, message: "message", data: responce });
  } catch (error) {
    console.log("Error in createNewIssue in issue  --->", error);
    res.status(404).json({ success: false, message: "issue not created" });
  }
};

export const getIssueByid = async (req: any, res: any) => {
  try {
    let data = zod.string().safeParse(req.query.id);
    if (!data.success) {
      return res.status(404).json({
        success: false,
        message: "Invalid inputs",
      });
    }

    let id = data.data;

    console.log("getIssueByid's is ", id);

    let responce = await issueService.getIssueById(id);
    res.json({ success: true, message: "issue found", data: responce });
  } catch (error) {
    console.log("Error in getIssueByid in issue  --->", error);
    res.status(404).json({ success: false, message: "issue not found" });
  }
};

export const getAllIssue = async (req: any, res: any) => {
  try {
    let getAllIssues = await issueService.getAllIssues();
    res.json({ success: true, message: "message", data: getAllIssues });
  } catch (error) {
    console.log("Error in getAllIssue in issue  --->", error);
    res.status(404).json({ success: false, message: "server error" });
  }
};
