import {
  ExamCreateInputeSchema,
  ExampatternInputZodSchema,
} from "../../zod/user.zod.js";
import { asyncHandler } from "@repo/lib/helper/asyncHandler.js";
import {
  create_targated_exam_year_zodSchemea,
  create_targated_exam_zodSchemea,
} from "../../zod/exam.zod.js";
import { ZodDataSafeParse } from "@repo/lib/ZodTypeChecker.js";
import { ExamService } from "../../services/exam.service.js";

const examService = new ExamService();

export const CreateNewExamPattern = asyncHandler(async (req: any, res: any) => {
  let data = ExampatternInputZodSchema.safeParse(req.body);
  if (!data.success) {
    console.log("data error", data.error);

    return res.status(401).json({
      success: false,
      message: "given credential/input   invalid ",
    });
  }

  await examService.createExamPattern(data.data, req.user);

  return res.json({
    success: true,
    message: "New Exam Pattern Created Successful",
  });
});

export const create_targeted_exam = asyncHandler(async (req: any, res: any) => {
  let processedata = create_targated_exam_zodSchemea.safeParse(req.body);
  if (!processedata.success) {
    throw ZodDataSafeParse(processedata, true);
  }

  let target_exam = await examService.createTargetedExam(processedata.data);

  return res.json({
    success: true,
    message: "targated_exam created successfuly",
    data: target_exam.name,
  });
});

export const create_targeted_exam_year = asyncHandler(
  async (req: any, res: any) => {
    let processedata = create_targated_exam_year_zodSchemea.safeParse(req.body);

    if (!processedata.success) {
      throw ZodDataSafeParse(processedata, true);
    }

    let target_exam_year = await examService.createTargetedExamYear(processedata.data);

    return res.json({
      success: true,
      message: "targated_exam_year created successfuly",
      data: target_exam_year.year,
    });
  }
);

export const CreateExam = asyncHandler(async (req: any, res: any) => {
  let data = ExamCreateInputeSchema.safeParse(req.body);

  if (!data.success) {
    throw ZodDataSafeParse(data, true);
  }

  let response = await examService.createExam(data.data, req.user);

  res.json({
    success: true,
    message: `New ${response.examtype}  Created Successful`,
  });
});
