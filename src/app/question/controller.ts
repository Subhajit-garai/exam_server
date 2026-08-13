import {
  QuestionFilterDataFetchZodSchema,
  questionInputZodSchema,
  questionUpdateZodSchema,
} from "@/zod/question.zod.js";
import { QuestionService, QuestionProcessingService } from "./service.js";
import { ZodDataSafeParse } from "@/utils/ZodTypeChecker.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { logger } from "@/utils/logger.js";
import { CustomError } from "@/middleware/globalErrorHandler.js";

const questionService = new QuestionService();
const questionProcessingService = new QuestionProcessingService();

// Question Controllers
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
    throw ZodDataSafeParse(data);
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
});

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
    throw ZodDataSafeParse(body);
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
});

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

// Question Processing Controllers
export const createProcessedQuestion = asyncHandler(async (req: any, res: any) => {
    const question = await questionProcessingService.createProcessedQuestion(req.user.id, req.body);

    res.status(200).json({
        success: true,
        message: "Question submitted for processing",
        data: question
    });
});

export const getProcessedQuestions = asyncHandler(async (req: any, res: any) => {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const filters = {
        status: req.query.status,
        topic_id: req.query.topic_id,
        subject_id: req.query.subject_id
    };

    const result = await questionProcessingService.getProcessedQuestions(filters, page);

    res.status(200).json({
        success: true,
        data: result
    });
});

export const reviewQuestion = asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    const { action, comment } = req.body;

    if (!['APPROVE', 'REJECT'].includes(action)) {
        throw new CustomError("Invalid action. Must be APPROVE or REJECT", 400);
    }

    const result = await questionProcessingService.reviewQuestion(req.user.id, id, action, comment);

    res.status(200).json({
        success: true,
        message: `Question ${action.toLowerCase()}d successfully`,
        data: result
    });
});

export const deleteProcessedQuestion = asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    await questionProcessingService.deleteProcessedQuestion(req.user.id, id);
    res.status(200).json({
        success: true,
        message: "Processed question deleted successfully"
    });
});

export const updateProcessedQuestion = asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    const updatedQuestion = await questionProcessingService.updateProcessedQuestion(req.user.id, id, req.body);
    res.status(200).json({
        success: true,
        message: "Processed question updated successfully",
        data: updatedQuestion
    });
});
