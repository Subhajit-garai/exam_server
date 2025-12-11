import { timeinpute } from "../zod/metrix.zod.js";
import { MetrixService } from "../services/metrix.service.js";

const metrixService = new MetrixService();

export const test = async (req: any, res: any) => {
  try {
    res.json({ success: true, message: "message", data: "data" });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const examQuestionAttemp = async (req: any, res: any) => {
  try {
    let data = await metrixService.examQuestionAttemp(req.user, req.query.examid);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "user's data not found in score"
      })
    }

    res.json({ success: true, message: "message", data: data });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const getDiffFromTopRanker = async (req: any, res: any) => {
  try {
    let userid = req.user as string;
    let examid = req.query.examid as string; // exam or contest or quiz

    res.json({ success: true, message: "message", data: "data" });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

// tested
export const WeekNessGraphOfAnExam = async (req: any, res: any) => {
  try {
    let examid = req.query.examid as string;
    let userid = req.user;

    if (!examid || !userid) return;

    const { sanitizedData, range } = await metrixService.WeekNessGraphOfAnExam(userid, examid);

    res.json({ success: true, message: "message", data: sanitizedData, range: range });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const getUserALLExamsRankData = async (req: any, res: any) => {
  try {
    let offset = req.param.offset ? req.param.offset : 10;
    let userid = req.user as string;

    let data = await metrixService.getUserALLExamsRankData(userid, offset);

    res.json({ success: true, message: "message", data: data });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const getTopNOfAnExam = async (req: any, res: any) => {
  try {
    let examid = req.query.examid as string; // exam or contest or quiz
    let offset = req.query.offset ? req.query.offset : "4";
    let userid = req.user as string;

    let data = await metrixService.getTopNOfAnExam(userid, examid, offset);

    if (!data) {
    }
    res.json({ success: true, message: "message", data: data });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const getAllUserRankFronAnExam = async (req: any, res: any) => {
  try {
    let examid = req.query.examid as string; // exam or contest or quiz
    let userid = req.user as string;

    const { data, myRank } = await metrixService.getAllUserRankFronAnExam(userid, examid);

    res.json({ success: true, message: "message", data: data, myRank: myRank });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const getExamRank = async (req: any, res: any) => {
  try {
    let examid = req.query.examid as string; // exam or contest or quiz

    let Rank = await metrixService.getExamRank(req.user, examid);

    res.json({ success: true, message: "message", data: Rank });
  } catch (error) {
    console.log("Error in metrix getExamRank --->", error);
  }
};

export const getperformance = async (req: any, res: any) => {
  try {
    let userid = req.user;

    let data = await metrixService.getperformance(userid);

    res.json({ success: true, message: "message", data: data });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const getScoreMetrix = async (req: any, res: any) => {
  try {
    let userid = req.user;
    let offset = req.query.offset;
    let startDate = req.query.startDate;
    let endDate = req.query.endDate;

    if (
      !offset ||
      !["week", "month", "day", "hour", "minute"].includes(offset)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid offset value" });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required for range filtering",
      });
    } else {
      startDate = parseInt(startDate);
      endDate = parseInt(endDate);
      if (
        !(
          timeinpute.safeParse(startDate).success &&
          timeinpute.safeParse(endDate).success
        )
      ) {
      }
      // console.log(timeinpute.safeParse(startDate));
    }

    const { finaldata, maxScore } = await metrixService.getScoreMetrix(userid, offset, startDate, endDate);

    res.json({
      success: true,
      message: "message",
      data: finaldata,
      range: maxScore,
    });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

import { SystemStateService } from "../services/system-state.service.js";
const systemStateService = new SystemStateService();

export const getSubjectScoreMetrix = async (req: any, res: any) => {
  try {
    let userid = req.user;
    let offset = req.query.offset;
    let startDate = req.query.startDate;
    let endDate = req.query.endDate;

    if (
      !offset ||
      !["week", "month", "day", "hour", "minute"].includes(offset)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid offset value" });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required for range filtering",
      });
    }

    const { finaldata, range } = await metrixService.getSubjectScoreMetrix(userid, offset, startDate, endDate);

    res.json({
      success: true,
      message: "message",
      data: finaldata,
      range: range,
    });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const getPlatformStats = async (req: any, res: any) => {
  try {
    const stats = await systemStateService.getSystemStats();
    res.json({ success: true, message: "Platform stats retrieved", data: stats });
  } catch (error) {
    console.log("Error in getPlatformStats --->", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
