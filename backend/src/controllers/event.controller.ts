import { eventSchema } from "../zod/event.zod.js";
import { ZodDataSafeParse } from "@repo/lib/ZodTypeChecker.js";
import { asyncHandler } from "@repo/lib/helper/asyncHandler.js";
import { EventService } from "../services/event.service.js";
import { logger } from "@repo/lib/helper/logger.js";



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

  let responce = await eventService.createEvent(eventdata.data);

  res.json({ success: true, message: "event ", data: "data" });
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

  let responce = await eventService.updateEvent(id, eventdata.data);

  res.json({ success: true, message: "event updated", data: responce });
});

export const deleteEvent = asyncHandler(async (req: any, res: any) => {
  const { id } = req.params;
  let responce = await eventService.deleteEvent(id);

  res.json({ success: true, message: "event deleted", data: responce });
});
