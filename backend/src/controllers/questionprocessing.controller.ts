import { QuestionProcessingService } from "../services/questionprocessing.service.js";
import { questionInputZodSchema } from "../zod/question.zod.js";

const questionProcessingService = new QuestionProcessingService();

export const createProcessedQuestion = async (req: any, res: any) => {
    try {
        // We can reuse the question input schema or create a new one if needed
        // For now, let's assume the input structure is similar to creating a question
        // but we might need to relax some constraints or add new fields like 'original_question_id'

        // let data = questionInputZodSchema.safeParse(req.body); 
        // if (!data.success) { ... }

        // Passing req.body directly for now as it might contain extra fields not in the schema yet
        const question = await questionProcessingService.createProcessedQuestion(req.user.id, req.body);

        res.status(200).json({
            success: true,
            message: "Question submitted for processing",
            data: question
        });
    } catch (error: any) {
        console.log("error : ", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};

export const getProcessedQuestions = async (req: any, res: any) => {
    try {
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
    } catch (error: any) {
        console.log("error : ", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};

export const reviewQuestion = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const { action, comment } = req.body; // action: 'APPROVE' | 'REJECT'

        if (!['APPROVE', 'REJECT'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: "Invalid action. Must be APPROVE or REJECT"
            });
        }

        const result = await questionProcessingService.reviewQuestion(req.user.id, id, action, comment);

        res.status(200).json({
            success: true,
            message: `Question ${action.toLowerCase()}d successfully`,
            data: result
        });
    } catch (error: any) {
        console.log("error : ", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};

export const deleteProcessedQuestion = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        await questionProcessingService.deleteProcessedQuestion(req.user.id, id);
        res.status(200).json({
            success: true,
            message: "Processed question deleted successfully"
        });
    } catch (error: any) {
        console.log("error : ", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};

export const updateProcessedQuestion = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const updatedQuestion = await questionProcessingService.updateProcessedQuestion(req.user.id, id, req.body);
        res.status(200).json({
            success: true,
            message: "Processed question updated successfully",
            data: updatedQuestion
        });
    } catch (error: any) {
        console.log("error : ", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};
