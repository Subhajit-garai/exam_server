import { asyncHandler } from "@/utils/asyncHandler.js";
import { updare_targated_exam_year_zodSchemea } from "../zod/exam.zod.js";
import { ZodDataSafeParse } from "@/utils/ZodTypeChecker.js";
import { SubmitedQuestionAnsZodSchema } from "../zod/question.zod.js";
import { ExamService } from "../services/exam.service.js";
import { ExamCreateInputeSchema } from "@/zod/user.zod.js";
import { logger } from "@/utils/logger.js";
import { CustomError } from "@/middleware/globalErrorHandler.js";

const examService = new ExamService();

export const test = asyncHandler(async (req: any, res: any) => {
  res.json({
    success: true,
    message: " created successfully",
    data: "data",
  });
});

export const refreshExam = asyncHandler(async (req: any, res: any) => {
  const userId = req.user;
  const { examid } = req.params;
  if (!examid) throw new Error("Exam Set ID is required");

  const response = await examService.refresh(examid, userId);
  if (!response) throw new Error("Exam set not added for refresh");

  res.json({
    success: true,
    message: "Exam set addded for refresh",
  });
});

export const CreateExam = asyncHandler(async (req: any, res: any) => {
  let data = ExamCreateInputeSchema.safeParse(req.body);

  if (!data.success) {
    throw ZodDataSafeParse(data, true);
  }

  let response = await examService.createExam(data.data, req.user);

  res.json({
    success: true,
    message: `New ${response.exam_type} Created Successful`,
  });
});

export const getUserAnsSetOfAnExam = asyncHandler(async (req: any, res: any) => {
  let examid = req.query.examid;
  let userid = req.user;

  let data = await examService.getUserAnsSetOfAnExam(userid, examid);
  res.json({ success: true, message: "message", data: data });
});

export const getUserMetaDataForExam = asyncHandler(async (req: any, res: any) => {
  let examid = req.query.examid;
  let userid = req.user;

  let data = await examService.getUserMetaDataForExam(userid, examid);
  res.json({ success: true, message: "message", data: data });
});



export const getCategoryName = asyncHandler(async (req: any, res: any) => {
  let Category = await examService.getCategoryName();

  res.json({
    success: true,
    message: ` available Categorys `,
    data: Category,
  });
});

export const getExamAttemptQuestionMetaData = asyncHandler(
  async (req: any, res: any) => {
    let examid = req.query.examid;
    let userid = req.user;
    let data = await examService.getExamAttemptQuestionMetaData(userid, examid);
    res.json({ success: true, message: "message", data: data });
  }
);

export const submitAnswerHandler = asyncHandler(async (req: any, res: any) => {
  let data = SubmitedQuestionAnsZodSchema.safeParse(req.query);

  if (!data.success) {
    throw ZodDataSafeParse(data, true);
  }

  let { examid, number, part, ans, ismultiple } = data.data;
  let userid = req.user;

  await examService.submitAnswerHandler(userid, examid, number, part, ans, ismultiple);

  logger.debug("Answer collected");

  return res.json({
    success: true,
    message: `ans collected`,
    data: "collected",
  });
});

export const finalSubmitExam = asyncHandler(async (req: any, res: any) => {
  let examid = req.query.examid;
  let userid = req.user;

  await examService.finalSubmitExam(userid, examid);

  logger.success("Exam Submitted");

  return res.json({
    success: true,
    message: `Exam Submitted Successfully`,
    data: "collected",
  });
});

export const getJoinedExamData = asyncHandler(async (req: any, res: any) => {
  let examid = req.query.examid;
  let type = req.query.type;
  let number = req.query.number;
  let part = req.query.part;
  let userid = req.user;

  logger.debug("getJoinedExamData query:", req.query);

  let question = await examService.getJoinedExamData(userid, examid, type, number, part);

  if (!question) {
    return res.status(400).json({
      success: false,
      message: `Question not found`,
    });
  }

  res.json({
    success: true,
    message: ` All user Exams`,
    data: question,
  });
});

export const examJoinRequestProcess = asyncHandler(
  async (req: any, res: any) => {
    let examid = req.query.id;
    let userid = req.user;
    await examService.examJoinRequestProcess(userid, examid);

    return res.json({
      success: true,
      message: `Exam setup Successful`,
      data: "no data",
    });
  }
);

export const getExamsById = asyncHandler(async (req: any, res: any) => {
  let response = await examService.getExamsById(req.query.id);

  return res.json({
    success: true,
    message: `${response.length < 1 ? " No Exams found" : "All Exams "} `,
    data: response,
  });
});

export const getExams = asyncHandler(async (req: any, res: any) => {
  let type = req.query.type;
  let page = req.query.page ?? 1;
  let limit = req.query.limit
    ? typeof req.query.limit === "string"
      ? parseInt(req.query.limit)
      : req.query.limit
    : 10;
  let order: "desc" | "asc" = req.query.order === "asc" ? "asc" : "desc";

  const pageNumber = page ? parseInt(page) : 1;

  const { exams, total, currentPage } = await examService.getExams(
    req.user,
    type,
    pageNumber,
    limit,
    order,
    req.query.starttime,
    req.query.endtime
  );

  res.json({
    success: true,
    message: `${exams.length < 1 ? " No Exams found" : `${exams.length} All Exams `} `,
    data: { exams: exams, total: total, currentPage: currentPage },
  });
});




