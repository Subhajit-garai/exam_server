import { asyncHandler } from "@/lib/helper/asyncHandler.js";
import { ZodDataSafeParse } from "@/lib/ZodTypeChecker";
import { TargetExamService } from "@/services/targetexam.service.js";
import { create_targated_exam_zodSchemea } from "@/zod/exam.zod.js";




const targetExamService = new TargetExamService();

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