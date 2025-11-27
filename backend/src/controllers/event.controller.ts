import prisma from "@repo/db/index.js";
import { eventSchema } from "../zod/event.zod.js";
import { ZodDataSafeParse } from "@/lib/ZodTypeChecker.js";
import { asyncHandler } from "@/lib/helper/asyncHandler.js";

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

  let { type, description, conditions, payload, created_by, runs, run_at } =
    eventdata.data;

  let responce = await prisma.events.create({
    data: {
      type,
      description,
      conditions,
      payload,
      created_by,
      runs,
      run_at,
    },
  });

  if (!responce) {
    return res
      .status(404)
      .json({ success: false, message: "server error, event not created  " });
  }
  res.json({ success: true, message: "event ", data: "data" });
});

export const getAllEvents = async (req: any, res: any) => {
  try {
    let allEvents = await prisma.events.findMany({});
    if (!allEvents) {
      return res.status(404).json({ success: false, message: "server error " });
    }
    res.json({ success: true, message: "message", data: allEvents });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};
