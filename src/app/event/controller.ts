import { eventSchema } from "@/zod/event.zod.js";
import { ZodDataSafeParse } from "@/utils/ZodTypeChecker.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { EventService } from "./service.js";
import { logger } from "@/utils/logger.js";

const eventService = new EventService();

export const test = asyncHandler(async (req: any, res: any) => {
  res.json({ success: true, message: "message", data: "data" });
});

export const createEvent = asyncHandler(async (req: any, res: any) => {
  let eventdata = eventSchema.safeParse(req.body);

  eventdata.error && logger.warn("[Zod validation error]", eventdata.error);

  if (!eventdata.success) {
    throw ZodDataSafeParse(eventdata);
  }

  let response = await eventService.createEvent(eventdata.data);

  res.json({ success: true, message: "event ", data: response });
});

export const getAllEvents = asyncHandler(async (req: any, res: any) => {
  let allEvents = await eventService.getAllEvents();
  res.json({ success: true, message: "message", data: allEvents });
});

export const updateEvent = asyncHandler(async (req: any, res: any) => {
  const { id } = req.params;
  let eventdata = eventSchema.safeParse(req.body);

  if (!eventdata.success) {
    throw ZodDataSafeParse(eventdata);
  }

  let response = await eventService.updateEvent(id, eventdata.data);

  res.json({ success: true, message: "event updated", data: response });
});

export const deleteEvent = asyncHandler(async (req: any, res: any) => {
  const { id } = req.params;
  let response = await eventService.deleteEvent(id);

  res.json({ success: true, message: "event deleted", data: response });
});
