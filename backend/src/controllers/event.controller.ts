import prisma from "../../db";
import { eventSchema } from "../zod/event.zod";

export const test = async (req: any, res: any) => {
  try {
    res.json({ success: true, message: "message", data: "data" });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const createEvent = async (req: any, res: any) => {
  try {    
    let eventdata = eventSchema.safeParse(req.body);

    if (!eventdata.success) {
      return res.status(404).json({
        success: false,
        message: "invalid inputes, event not created  ",
      });
    }

    let { type, description, conditions, data, created_by, runs, run_at } =
      eventdata.data;

    let responce = await prisma.events.create({
      data: {
        type,
        description,
        conditions,
        data,
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
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};




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
