import { timeinpute } from "@/zod/metrix.zod.js";
import { MetrixService } from "./service.js";
import { logger } from "@/utils/logger.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { CustomError } from "@/middleware/globalErrorHandler.js";
import { SystemStateService } from "./service.js";

const metrixService = new MetrixService();
const systemStateService = new SystemStateService();

export const test = asyncHandler(async (req: any, res: any) => {
  res.json({ success: true, message: "message", data: "data" });
});

export const examQuestionAttemp = asyncHandler(async (req: any, res: any) => {
  let data = await metrixService.examQuestionAttemp(req.user, req.query.examid);

  if (!data) {
    return res.status(404).json({
      success: false,
      message: "user's data not found in score"
    })
  }

  res.json({ success: true, message: "message", data: data });
});

export const getDiffFromTopRanker = asyncHandler(async (req: any, res: any) => {
  let userid = req.user as string;
  let examid = req.query.examid as string; // exam or contest or quiz

  res.json({ success: true, message: "message", data: "data" });
});

export const WeekNessGraphOfAnExam = asyncHandler(async (req: any, res: any) => {
  let examid = req.query.examid as string;
  let userid = req.user;

  if (!examid || !userid) return;

  const { sanitizedData, range } = await metrixService.WeekNessGraphOfAnExam(userid, examid);

  res.json({ success: true, message: "message", data: sanitizedData, range: range });
});

export const getUserALLExamsRankData = asyncHandler(async (req: any, res: any) => {
  let offset = req.param.offset ? req.param.offset : 10;
  let userid = req.user as string;

  let data = await metrixService.getUserALLExamsRankData(userid, offset);

  res.json({ success: true, message: "message", data: data });
});

export const getTopNOfAnExam = asyncHandler(async (req: any, res: any) => {
  let examid = req.query.examid as string; // exam or contest or quiz
  let offset = req.query.offset ? req.query.offset : "4";
  let userid = req.user as string;

  let data = await metrixService.getTopNOfAnExam(userid, examid, offset);

  if (!data) {
  }
  res.json({ success: true, message: "message", data: data });
});

export const getAllUserRankFronAnExam = asyncHandler(async (req: any, res: any) => {
  let examid = req.query.examid as string; // exam or contest or quiz
  let userid = req.user as string;

  const { data, myRank } = await metrixService.getAllUserRankFronAnExam(userid, examid);

  res.json({ success: true, message: "message", data: data, myRank: myRank });
});

export const getExamRank = asyncHandler(async (req: any, res: any) => {
  let examid = req.query.examid as string; // exam or contest or quiz

  let Rank = await metrixService.getExamRank(req.user, examid);

  res.json({ success: true, message: "message", data: Rank });
});

export const getperformance = asyncHandler(async (req: any, res: any) => {
  let userid = req.user;

  let data = await metrixService.getperformance(userid);

  res.json({ success: true, message: "message", data: data });
});

export const getScoreMetrix = asyncHandler(async (req: any, res: any) => {
  let userid = req.user;
  let offset = req.query.offset;
  let startDate = req.query.startDate;
  let endDate = req.query.endDate;

  if (
    !offset ||
    !["week", "month", "day", "hour", "minute"].includes(offset)
  ) {
    throw new CustomError("Invalid offset value", 400);
  }

  if (!startDate || !endDate) {
    throw new CustomError("Start date and end date are required for range filtering", 400);
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
  }

  const { finaldata, maxScore } = await metrixService.getScoreMetrix(userid, offset, startDate, endDate);

  res.json({
    success: true,
    message: "message",
    data: finaldata,
    range: maxScore,
  });
});

export const getSubjectScoreMetrix = asyncHandler(async (req: any, res: any) => {
  let userid = req.user;
  let offset = req.query.offset;
  let startDate = req.query.startDate;
  let endDate = req.query.endDate;

  if (
    !offset ||
    !["week", "month", "day", "hour", "minute"].includes(offset)
  ) {
    throw new CustomError("Invalid offset value", 400);
  }

  if (!startDate || !endDate) {
    throw new CustomError("Start date and end date are required for range filtering", 400);
  }


  const { finaldata, range } = await metrixService.getSubjectScoreMetrix(userid, offset, startDate, endDate);

  res.json({
    success: true,
    message: "message",
    data: finaldata,
    range: range,
  });
});

export const getPlatformStats = asyncHandler(async (req: any, res: any) => {
  const stats = await systemStateService.getSystemStats();
  res.json({ success: true, message: "Platform stats retrieved", data: stats });
});
