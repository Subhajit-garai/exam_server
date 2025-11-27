import { Request, Response } from "express";
import { ExamEventsService } from "../services/examEvents.service.js";
import { asyncHandler } from "@repo/lib/helper/asyncHandler.js";

const eventService = new ExamEventsService();

export class ExamEventsController {
    getEvents = asyncHandler(async (req: Request, res: Response) => {
        let examyear = req.query.examyear as string;
        if (!examyear) {
            return res.status(400).json({ success: false, message: "Exam year is required" });
        }
        const events = await eventService.getAllEvents(examyear);
        res.status(200).json({ success: true, data: events });
    });

    createEvent = asyncHandler(async (req: Request, res: Response) => {
        const event = await eventService.createEvent(req.body);
        res.status(201).json({ success: true, data: event });
    });

    updateEvent = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const updatedEvent = await eventService.updateEvent(id, req.body);
        res.status(200).json({ success: true, data: updatedEvent });
    });

    deleteEvent = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        await eventService.deleteEvent(id);
        res.status(200).json({ success: true, message: "Event deleted successfully" });
    });
}

const controller = new ExamEventsController();

export const getEvents = controller.getEvents;
export const createEvent = controller.createEvent;
export const updateEvent = controller.updateEvent;
export const deleteEvent = controller.deleteEvent;
