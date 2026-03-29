import { asyncHandler } from "@/lib/helper/asyncHandler.js";
import { BotService } from "../../services/bot/bot.service.js";

const botService = new BotService();

export const examQuestionAddedCompletionStatusCheck = asyncHandler(async (req: any, res: any) => {
    const { examid } = req.params;
    const data = await botService.exam.checkExamCompletionStatus(examid);
    res.json({
        success: true,
        message: "message",
        data: data,
    });
});

export const getExamDetails = asyncHandler(async (req: any, res: any) => {
    const { examid } = req.params;
    const data = await botService.exam.getExamDetails(examid);
    res.json({ success: true, message: "message", data: data });
});
