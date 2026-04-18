import { QuestionProcessingService } from "../services/questionprocessing.service.js";
import { questionInputZodSchema } from "../zod/question.zod.js";
import { logger } from "@repo/lib/helper/logger.js";
import { asyncHandler } from "@repo/lib/helper/asyncHandler.js";
import { CustomError } from "@/middleware/globalErrorHandler.js";

const questionProcessingService = new QuestionProcessingService();


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
    const { action, comment } = req.body; // action: 'APPROVE' | 'REJECT'

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

