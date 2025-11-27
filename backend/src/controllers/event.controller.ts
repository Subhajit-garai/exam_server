import { eventSchema } from "../zod/event.zod.js";
import { ZodDataSafeParse } from "@/lib/ZodTypeChecker.js";
import { asyncHandler } from "@/lib/helper/asyncHandler.js";
import { EventService } from "../services/event.service.js";

const eventService = new EventService();

export const test = async (req: any, res: any) => {
  try {
    res.json({ success: true, message: "message", data: "data" });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const createEvent = asyncHandler(async (req: any, res: any) => {
  let eventdata = eventSchema.safeParse(req.body);

  eventdata.error && console.log("[logging error]", eventdata.error);

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
    console.log("Error in metrix --->", error);
    res.status(404).json({ success: false, message: "server error" });
  }
};
