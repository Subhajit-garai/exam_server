import {
  ExampatternInputZodSchema,
} from "../zod/user.zod.js";
import { asyncHandler } from "@repo/lib/helper/asyncHandler.js";
import { ZodDataSafeParse } from "@repo/lib/ZodTypeChecker.js";
import { ExampatternService } from "../services/exampattern.service.js";

const exampatternService = new ExampatternService();


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
  let { id } = req.body;
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


