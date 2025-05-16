import prisma from "../../db";
import zod from "zod";
import { IssueInpute_zod_type } from "../zod/issue.zod";
import { Status } from "@prisma/client";

export const test = async (req: any, res: any) => {
  try {
    res.json({ success: true, message: "message", data: "data" });
  } catch (error) {
    console.log("Error in updateStatus in issue  --->", error);
  }
};

export const RemoveIssue = async (req: any, res: any) => {
  try {
    let data = zod.string().safeParse(req.query.id);
    if (!data.success) {
      return res.status(404).json({
        success: false,
        message: "invalid inputes, event not created  ",
      });
    }
    let id = data.data;

    let responce = await prisma.issue.delete({
      where: {
        id: id,
      },
    });
    if (!responce) {
      return res.status(404).json({
        success: false,
        message: "error in priority voting ",
      });
    }

    res.json({ success: true, message: "message", data: responce });

  } catch (error) {
    console.log("Error in RemoveIssue in issue --->", error);
  }
};


export const updateStatus = async (req: any, res: any) => {
  try {

    console.log("req.body" , req.body);
    
    let data = zod
      .object({
        id: zod.string(),
        status: zod.nativeEnum(Status),
      })
      .safeParse(req.body);


    if (!data.success) {
      return res.status(404).json({
        success: false,
        message: "invalid inputes, event not created  ",
      });
    }
    let { id , status } = data.data;

    let responce = await prisma.issue.update({
      where: {
        id: id,
      },
      data: {
        status: status,
      },
    });
    if (!responce) {
      return res.status(404).json({
        success: false,
        message: "error in priority voting ",
      });
    }

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
        message: "invalid inputes, event not created  ",
      });
    }
    let id = data.data;

    let responce = await prisma.issue.update({
      where: {
        id: id,
      },
      data: {
        status: Status.Close,
      },
    });
    if (!responce) {
      return res.status(404).json({
        success: false,
        message: "error in priority voting ",
      });
    }

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
        message: "invalid inputes, event not created  ",
      });
    }
    let id = data.data;

    let responce = await prisma.issue.update({
      where: {
        id: id,
      },
      data: {
        downVote: {
          increment: 1,
        },
      },
    });
    if (!responce) {
      return res.status(404).json({
        success: false,
        message: "error in priority voting ",
      });
    }

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
        message: "invalid inputes, event not created  ",
      });
    }
    let id = data.data;

    let responce = await prisma.issue.update({
      where: {
        id: id,
      },
      data: {
        upVote: {
          increment: 1,
        },
      },
    });
    if (!responce) {
      return res.status(404).json({
        success: false,
        message: "error in priority voting ",
      });
    }

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
        message: "invalid inputes, event not created  ",
      });
    }
    let id = data.data;

    let responce = await prisma.issue.update({
      where: {
        id: id,
      },
      data: {
        priorityVote: {
          increment: 1,
        },
      },
    });
    if (!responce) {
      return res.status(404).json({
        success: false,
        message: "error in priority voting ",
      });
    }

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
        message: "invalid inputes, event not created  ",
      });
    }
    let id = data.data;

    console.log("update_issue's id is ", id);
    let responce = await prisma.issue.findFirst({
      where: { id: id },
    });

    if (!responce) {
      return res.status(404).json({
        success: false,
        message: "issue not found ",
      });
    }

    res.json({ success: true, message: "message", data: responce });
  } catch (error) {
    console.log("Error in Isprocessed_issue in issue  --->", error);
  }
};

export const update_issue = async (req: any, res: any) => {
  try {
    let data = zod.string().safeParse(req.query.id);
    if (!data.success) {
      return res.status(404).json({
        success: false,
        message: "invalid inputes, event not created  ",
      });
    }
    let id = data.data;

    console.log("update_issue's id is ", id);

    let newData = IssueInpute_zod_type.safeParse(req.body);

    if (!newData.success) {
      return res.status(404).json({
        success: false,
        message: "invalid inputes, event not created  ",
      });
    }

    let { type, note, IssueDetails } = newData.data;

    let responce = await prisma.issue.update({
      where: {
        id: id,
      },
      data: {
        type,
        note,
        IssueDetails,
        created_by: req.user,
        creator_role: req.userRole,
      },
    });
    if (!responce) {
      return res.status(404).json({
        success: false,
        message: "issue not found ",
      });
    }

    res.json({ success: true, message: "message", data: responce });
  } catch (error) {
    console.log("Error in update_issue in issue  --->", error);
  }
};

export const createNewIssue = async (req: any, res: any) => {
  try {

    console.log("data" , req.body);
    
    let data = IssueInpute_zod_type.safeParse(req.body);

    if (!data.success) {
      return res.status(404).json({
        success: false,
        message: "invalid inputes, issue not created  ",
      });
    }

    let { type, note, IssueDetails } = data.data;

    console.log("role" , req.userRole);
    

    let responce = await prisma.issue.create({
      data: {
        type,
        note,
        IssueDetails,
        created_by: req.user,
        creator_role: req.userRole,
      },
    });

    if (!responce) {
      return res.status(404).json({
        success: false,
        message: "issue not created ",
      });
    }

    res.json({ success: true, message: "message", data: responce });
  } catch (error) {
    console.log("Error in createNewIssue in issue  --->", error);
  }
};

export const getIssueByid = async (req: any, res: any) => {
  try {
    let data = zod.string().safeParse(req.query.id);
    if (!data.success) {
      return res.status(404).json({
        success: false,
        message: "invalid inputes, event not created  ",
      });
    }

    let id = data.data;

    console.log("getIssueByid's is ", id);

    let responce = await prisma.issue.findFirst({
      where: {
        id: id,
      },
    });
    if (!responce) {
      return res.status(404).json({
        success: false,
        message: "issue not found ",
      });
    }
    res.json({ success: true, message: "issue found", data: responce });
  } catch (error) {
    console.log("Error in getIssueByid in issue  --->", error);
  }
};

export const getAllIssue = async (req: any, res: any) => {
  try {
    let getAllIssues = await prisma.issue.findMany({});
    if (!getAllIssue) {
      return res.status(404).json({ success: false, message: "server error " });
    }
    res.json({ success: true, message: "message", data: getAllIssues });
  } catch (error) {
    console.log("Error in getAllIssue in issue  --->", error);
  }
};
