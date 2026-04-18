import { asyncHandler } from "@/lib/helper/asyncHandler.js";
import { ZodDataSafeParse } from "@/lib/ZodTypeChecker.js";
import { TargetExamYearService } from "@/services/targetexamyear.service.js";
import { create_targated_exam_year_zodSchemea, updare_targated_exam_year_zodSchemea } from "@/zod/exam.zod.js";




const targetExamYearService = new TargetExamYearService();
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