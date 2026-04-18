import { eventSchema } from "../zod/event.zod.js";
import { ZodDataSafeParse } from "@/lib/ZodTypeChecker.js";
import { asyncHandler } from "@/lib/helper/asyncHandler.js";
import { EventService } from "../services/event.service.js";
import { logger } from "@/lib/helper/logger.js";


const eventService = new EventService();

export const test = async (req: any, res: any) => {
  try {
    res.json({ success: true, message: "message", data: "data" });
  } catch (error) {
    logger.error("Error in test:", error);
  }
};

export const createEvent = asyncHandler(async (req: any, res: any) => {
  let eventdata = eventSchema.safeParse(req.body);

  eventdata.error && logger.warn("[Zod validation error]", eventdata.error);

  if (!eventdata.success) {
    throw ZodDataSafeParse(eventdata);
  }

  let responce = await eventService.createEvent(eventdata.data);

  res.json({ success: true, message: "event ", data: "data" });
});

export const getAllEvents = async (req: any, res: any) => {
  try {
    let allEvents = await eventService.getAllEvents();
    res.json({ success: true, message: "message", data: allEvents });
  } catch (error) {
    logger.error("Error in getAllEvents:", error);
    res.status(404).json({ success: false, message: "server error" });
  }
};

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
