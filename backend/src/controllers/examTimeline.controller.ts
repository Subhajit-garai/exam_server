import { Request, Response } from "express";
import { ExamTimelineService } from "../services/examTimeline.service.js";
import { asyncHandler } from "@repo/lib/helper/asyncHandler.js";
import { CreateExamTimelineSchema, UpdateExamTimelineSchema } from "../zod/examTimeline.zod.js";
import { ZodDataSafeParse } from "@/lib/ZodTypeChecker.js";

const timelineService = new ExamTimelineService();

export class ExamTimelineController {
    getTimelines = asyncHandler(async (req: Request, res: Response) => {
        let examyear = req.query.examyear as string;
        if (!examyear) {
            return res.status(400).json({ success: false, message: "Exam year is required" });
        }
        const timelines = await timelineService.getAllTimelines(examyear);
        res.status(200).json({ success: true, data: timelines });
    });

    getAllTimelines = asyncHandler(async (req: Request, res: Response) => {
        const timelines = await timelineService.getAllDistinctTimelines();
        res.status(200).json({ success: true, data: timelines });
    });

    createTimeline = asyncHandler(async (req: Request, res: Response) => {
        const parsedData = CreateExamTimelineSchema.safeParse(req.body);
        if (!parsedData.success) {
            throw ZodDataSafeParse(parsedData, true);
        }
        const timeline = await timelineService.createTimeline(parsedData.data);
        res.status(201).json({ success: true, data: timeline });
    });

    updateTimeline = asyncHandler(async (req: Request, res: Response) => {
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

    deleteTimeline = asyncHandler(async (req: Request, res: Response) => {
        const id = req.query.id as string;
        if (!id) {
            return res.status(400).json({ success: false, message: "Timeline ID is required" });
        }
        await timelineService.deleteTimeline(id);
        res.status(200).json({ success: true, message: "Timeline deleted successfully" });
    });
}

const controller = new ExamTimelineController();

export const getTimelines = controller.getTimelines;
export const createTimeline = controller.createTimeline;
export const updateTimeline = controller.updateTimeline;
export const deleteTimeline = controller.deleteTimeline;
export const getAllTimelines = controller.getAllTimelines;
