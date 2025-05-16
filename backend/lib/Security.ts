import { eventRuns, eventType, UserRole } from "@prisma/client";
import prisma from "../db";

import { z } from "zod";
import { events } from "./types/EventTypes";
import { isAdmin } from "./auth";

const settingsSchema = z.object({
  status: z.string(),
});



export const IsPurchasesOpen = async (req: any, res: any, next: () => any) => {
  try {
    let isLoginOpen = await prisma.appConfig.findFirst({
      where: {
        feature: "token-purchases",
      },
      select: {
        settings: true,
      },
    });

    const parsedSettings = settingsSchema.safeParse(isLoginOpen?.settings);

    if (parsedSettings.success && parsedSettings.data.status === "open") {
      next();
    } else {
      let messageEvent: events = {
        type: eventType.SEND_MESSAGE,
        description: "inform user that token-purchases is open ",
        data: { to: req.user, message: "token-purchases is open now" },
        conditions: {
          when: { on: "appConfig", feature: "token-purchases", status: "open" },
        },
        created_by: UserRole.Admin,
        runs: eventRuns.ONE,
        run_at: "Any",
      };

      let event = await prisma.events.create({
        data: {
          ...messageEvent,
        },
      });
      if (event) {
        return res.status(401).json({
          success: false,
          message:
            "Token purchases are currently closed. Please contact the admin for more information. We’ll notify you once they reopen.",
        });
      }
    }
  } catch (error) {
    console.log("error ", error);

    return res.status(401).json({
      success: false,
      message: "User login service is closed for now",
    });
  }
};

export const IsUserSignUpOpen = async (req: any, res: any, next: () => any) => {
  try {
    let isLoginOpen = await prisma.appConfig.findFirst({
      where: {
        feature: "user-signup",
      },
      select: {
        settings: true,
      },
    });

    const parsedSettings = settingsSchema.safeParse(isLoginOpen?.settings);

    if (parsedSettings.success && parsedSettings.data.status === "open") {
      next();
    } else {
      console.log("User signup service is closed");
      return res.status(401).json({
        success: false,
        message: "User signup service is closed for now",
      });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "User signup service is closed for now",
    });
  }
};

export const IsUserLoginOpen = async (req: any, res: any, next: () => any) => {
  try {
    let isLoginOpen = await prisma.appConfig.findFirst({
      where: {
        feature: "user-login",
      },
      select: {
        settings: true,
      },
    });

    const parsedSettings = settingsSchema.safeParse(isLoginOpen?.settings);

    if (parsedSettings.success && parsedSettings.data.status === "open") {
      next();
    } else {
      console.log("checking admin log in .....");
      
      await isAdmin(req,res,next ,"User login service is closed for now")
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "User login service is closed for now",
    });
  }
};
