import {
  QuestionFilterDataFetchZodSchema,
  questionInputZodSchema,
  questionUpdateZodSchema,
} from "../zod/question.zod.js";
import { QuestionService } from "../services/question.service.js";
import { ZodDataSafeParse } from "@/utils/ZodTypeChecker.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { logger } from "@/utils/logger.js";
import { CustomError } from "@/middleware/globalErrorHandler.js";



const questionService = new QuestionService();

export const updateQuestion = asyncHandler(async (req: any, res: any) => {
  logger.debug("req.body", req.body);

  let data = questionUpdateZodSchema.safeParse(req.body);
  if (!data.success) {
    throw ZodDataSafeParse(data);
  }

  let question = await questionService.updateQuestion(req.user, data.data);

  if (!question) {
    throw new CustomError("Question not updated", 400);
  }

  res.status(200).json({
    success: true,
    message: "Question updated successfully",
  });
});


export const GetQuestionExplanation = asyncHandler(async (req: any, res: any) => {
  let questionid = req.query.questionid;

  let data = await questionService.getQuestionExplanation(questionid);
  res.json({ success: true, message: "Question Explanation", data: data });
});


export const checkQuestion = asyncHandler(async (req: any, res: any) => {
  let { title } = req.body;

  let responce = await questionService.checkQuestion(title);

  if (responce.length > 0) {
    return res.status(200).json({
      success: true,
      message: "Question already exist",
      data: responce,
    });
  }
  return res.status(200).json({
    success: true,
    message: "Question not exist",
  });
});

export const createQuestion = asyncHandler(async (req: any, res: any) => {

  let data = questionInputZodSchema.safeParse(req.body);

  if (!data.success) {
    throw ZodDataSafeParse(data)
  }

  let question = await questionService.createQuestion(req.user, data.data);

  if (!question) {
    return res.status(400).json({
      success: false,
      message: "Question not created ",
    });
  }

  res.status(200).json({
    success: true,
    message: "Question created successfully",
  });
})

export const getQuestion = asyncHandler(async (req: any, res: any) => {
  let QuestionId = req.params.id;
  let responce = await questionService.getQuestion(QuestionId);

  if (!responce) {
    throw new CustomError("Question not found", 404);
  }

  res.status(200).json({
    success: true,
    data: responce,
  });
});


export const getQuestionalldatabyID = asyncHandler(async (req: any, res: any) => {
  let QuestionId = req.params.id;
  let responce = await questionService.getQuestionAllDataById(QuestionId);

  if (!responce) {
    throw new CustomError("Question not found", 404);
  }

  res.status(200).json({
    success: true,
    data: responce,
  });
});


export const deleteQuestion = asyncHandler(async (req: any, res: any) => {
  const questionId = req.params.id;
  const userId = req.user;

  const question = await questionService.deleteQuestion(userId, questionId);

  res.status(200).json({
    success: true,
    message: "Question deleted successfully",
    data: question,
  });
});


export const getAllQuestions = asyncHandler(async (req: any, res: any) => {

  let body = QuestionFilterDataFetchZodSchema.safeParse(req.query);
  if (!body.success) {
    throw ZodDataSafeParse(body)
  }

  const pageNumber = body.data.page ? parseInt(body.data.page) : 1;

  const { questions, total, currentPage } = await questionService.getAllQuestions(body.data, pageNumber);

  if (!questions) {
    return res.status(404).json({
      success: false,
      message: "questions not found",
    });
  }

  res.status(200).json({
    success: true,
    data: { questions: questions, total: total, currentPage: currentPage },
  });

})

export const backupQuestion = asyncHandler(async (req: any, res: any) => {
  const { questions, total } = await questionService.backupQuestion();

  res.status(200).json({
    success: true,
    data: { questions: questions, total: total },
  });
});


export const getSubjectCounts = asyncHandler(async (req: any, res: any) => {

  const category = req.query.category;
  const data = await questionService.getSubjectCounts(category);
  res.status(200).json({
    success: true,
    data: data,
  });

});

export const getTopicCounts = asyncHandler(async (req: any, res: any) => {

  const subjectId = req.params.subjectId;
  if (!subjectId) {
    return res.status(400).json({
      success: false,
      message: "Subject ID is required",
    });
  }

  const data = await questionService.getTopicCounts(subjectId, req.query.category);
  res.status(200).json({
    success: true,
    data: data,
  });

});
