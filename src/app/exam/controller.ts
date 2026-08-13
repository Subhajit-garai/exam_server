import { asyncHandler } from "@/utils/asyncHandler.js";
import { updare_targated_exam_year_zodSchemea, create_targated_exam_zodSchemea, create_targated_exam_year_zodSchemea } from "@/zod/exam.zod.js";
import { ZodDataSafeParse } from "@/utils/ZodTypeChecker.js";
import { SubmitedQuestionAnsZodSchema } from "@/zod/question.zod.js";
import { ExamCreateInputeSchema, ExampatternInputZodSchema } from "@/zod/user.zod.js";
import { CreateExamTimelineSchema, UpdateExamTimelineSchema } from "@/zod/examTimeline.zod.js";
import { logger } from "@/utils/logger.js";
import { CustomError } from "@/middleware/globalErrorHandler.js";
import { Request, Response } from "express";
import {
  ExamService,
  ExampatternService,
  ExamTimelineService,
  TargetExamService,
  TargetExamYearService,
} from "./service.js";

const examService = new ExamService();
const exampatternService = new ExampatternService();
const timelineService = new ExamTimelineService();
const targetExamService = new TargetExamService();
const targetExamYearService = new TargetExamYearService();

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

// Exam Pattern Handlers
export const CreateNewExamPattern = asyncHandler(async (req: any, res: any) => {
  let data = ExampatternInputZodSchema.safeParse(req.body);
  if (!data.success) {
    throw ZodDataSafeParse(data, true);
  }

  await exampatternService.createExamPattern(data.data, req.user);

  return res.json({
    success: true,
    message: "New Exam Pattern Created Successful",
  });
});

export const getAvailableExamPattern = asyncHandler(
  async (req: any, res: any) => {
    let exam = req.query.exam.toUpperCase();
    let user = req.user;

    let response = await exampatternService.getAvailableExamPattern(exam, user);

    res.json({
      success: true,
      message: `available Exam patterns`,
      data: response,
    });
  }
);

export const getExamPatternById = asyncHandler(async (req: any, res: any) => {
  let { id } = req.params;
  let response = await exampatternService.getExamPatternById(id);
  res.json({
    success: true,
    message: "Exam Pattern fetched successfully",
    data: response,
  });
});

export const updateExamPattern = asyncHandler(async (req: any, res: any) => {
  let response = await exampatternService.updateExamPattern(req.body, req.user);
  res.json({
    success: true,
    message: "Exam Pattern updated successfully",
    data: response,
  });
});

export const deleteExamPattern = asyncHandler(async (req: any, res: any) => {
  let { id } = req.params;
  let response = await exampatternService.deleteExamPattern(id);
  res.json({
    success: true,
    message: "Exam Pattern deleted successfully",
    data: response,
  });
});

// Exam Timeline Handlers
export const getTimelines = asyncHandler(async (req: Request, res: Response) => {
  let examyear = req.query.examyear as string;
  if (!examyear) {
      return res.status(400).json({ success: false, message: "Exam year is required" });
  }
  const timelines = await timelineService.getAllTimelines(examyear);
  res.status(200).json({ success: true, data: timelines });
});

export const getAllTimelines = asyncHandler(async (req: Request, res: Response) => {
  const timelines = await timelineService.getAllDistinctTimelines();
  res.status(200).json({ success: true, data: timelines });
});

export const createTimeline = asyncHandler(async (req: Request, res: Response) => {
  const parsedData = CreateExamTimelineSchema.safeParse(req.body);
  if (!parsedData.success) {
      throw ZodDataSafeParse(parsedData, true);
  }
  const timeline = await timelineService.createTimeline(parsedData.data);
  res.status(201).json({ success: true, data: timeline });
});

export const updateTimeline = asyncHandler(async (req: Request, res: Response) => {
  const id = req.query.id as string;
  if (!id) {
      return res.status(400).json({ success: false, message: "Timeline ID is required" });
  }
  const parsedData = UpdateExamTimelineSchema.safeParse(req.body);

  if (!parsedData.success) {
      throw ZodDataSafeParse(parsedData, true);
  }
  const updatedTimeline = await timelineService.updateTimeline(id, parsedData.data);
  res.status(200).json({ success: true, data: updatedTimeline });
});

export const deleteTimeline = asyncHandler(async (req: Request, res: Response) => {
  const id = req.query.id as string;
  if (!id) {
      return res.status(400).json({ success: false, message: "Timeline ID is required" });
  }
  await timelineService.deleteTimeline(id);
  res.status(200).json({ success: true, message: "Timeline deleted successfully" });
});

// Target Exam Handlers
export const create_targeted_exam = asyncHandler(async (req: any, res: any) => {
    let processedata = create_targated_exam_zodSchemea.safeParse(req.body);
    if (!processedata.success) {
        throw ZodDataSafeParse(processedata, true);
    }

    let target_exam = await targetExamService.createTargetedExam(processedata.data);

    return res.json({
        success: true,
        message: "targated_exam created successfuly",
        data: target_exam.name,
    });
});

export const fetchTargetedExamById = asyncHandler(
    async (req: any, res: any) => {
        let { id } = req.query;
        let target_exam = await targetExamService.fetchTargetedExamById(id);

        return res.json({
            success: true,
            message: "targated_exam created successfuly",
            data: target_exam.name,
        });
    }
);

export const getAvailableTargetExamAll = asyncHandler(
    async (req: any, res: any) => {
        try {
            let availableExam = await targetExamService.getAvailableTargetExamAll();

            return res.json({
                success: true,
                message: ` available Exam  names`,
                data: availableExam,
            });
        } catch (error: any) {
            throw error;
        }
    }
);

export const getAvailableTargetExam = asyncHandler(
    async (req: any, res: any) => {
        let category = req.query.category;
        try {
            let availableExam = await targetExamService.getAvailableTargetExam(category);

            return res.json({
                success: true,
                message: ` available Exam  names`,
                data: availableExam,
            });
        } catch (error: any) {
            throw error;
        }
    }
);

// Target Exam Year Handlers
export const getExamYearInfo = asyncHandler(async (req: any, res: any) => {
    let { examname, id } = req.query;

    let exam_year = await targetExamYearService.getExamYearInfo(examname, id);

    return res.json({
        success: true,
        message: `Exam Submitted Successfully`,
        data: exam_year,
    });
});

export const updateTargetedExamYear = asyncHandler(
    async (req: any, res: any) => {
        let processedData = updare_targated_exam_year_zodSchemea.safeParse(
            req.body
        );

        if (!processedData.success) {
            throw ZodDataSafeParse(processedData);
        }

        let updated_target_exam_year = await targetExamYearService.updateTargetedExamYear(processedData.data);

        res.json({
            success: true,
            message: "  updated_target_exam_year successfuly",
            data: updated_target_exam_year,
        });
    }
);

export const create_targeted_exam_year = asyncHandler(
    async (req: any, res: any) => {
        let processedata = create_targated_exam_year_zodSchemea.safeParse(req.body);

        if (!processedata.success) {
            throw ZodDataSafeParse(processedata, true);
        }

        let target_exam_year = await targetExamYearService.createTargetedExamYear(processedata.data);

        return res.json({
            success: true,
            message: "targated_exam_year created successfuly",
            data: target_exam_year.year,
        });
    }
);
