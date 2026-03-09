
import prisma from "@repo/db/index.js";

import { z } from "zod";
import { isAdmin } from "./auth.js";
import { setCookie } from "../token.js";
import { asyncHandler } from "../helper/asyncHandler.js";
import { CustomError } from "@/middleware/globalErrorHandler.js";
import { logger } from "../helper/logger.js";

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
      // let messageEvent: events = {
      //   type: eventType.SEND_MESSAGE,
      //   description: "inform user that token-purchases is open ",
      //   data: { to: req.user, message: "token-purchases is open now" },
      //   conditions: {
      //     when: { on: "appConfig", feature: "token-purchases", status: "open" },
      //   },
      //   created_by: UserRole.Admin,
      //   runs: eventRuns.ONE,
      //   run_at: "Any",
      // };

      // let event = await prisma.events.create({
      //   data: {
      //     ...messageEvent,
      //   },
      // });
      let event = true
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

export const IsCouponOpen = asyncHandler(async (req: any, res: any, next: () => any) => {
  let isLoginOpen = await prisma.appConfig.findFirst({
    where: {
      feature: "use-coupon",
    },
    select: {
      settings: true,
    },
  });

  const parsedSettings = settingsSchema.safeParse(isLoginOpen?.settings);

  if (parsedSettings.success && parsedSettings.data.status === "open") {
    next();
  } else {
    throw new CustomError("Coupon service is closed for now", 401);
  }
})


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
      await isAdmin(req, res, next, "User login service is closed for now");
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "User login service is closed for now",
    });
  }
};
export const IsRazorpayTestAccessOpen = async (
  req: any,
  res: any,
  next: () => any
) => {
  try {
    let { email, password } = req.body;

    if (email === process.env.RAZORPAY_TESTACCESS_USER_EMAIL?.trim()) {
      logger.info("razorpay accessing ....")

      let settings = await prisma.appConfig.findFirst({
        where: {
          feature: "razorpay-testaccess",
        },
      });

      const parsedSettings = settingsSchema.safeParse(settings?.settings);

      if (parsedSettings.success && parsedSettings.data.status === "open") {
        if (password === process.env.RAZORPAY_TESTACCESS_PASSWORD?.trim()) {
          let User = await prisma.user.findUnique({
            where: {
              email: email,
            },
            select: {
              id: true,
            },
          });

          if (!User)
            return res.status(404).json({
              success: true,
              message: "user not found",
            });
          setCookie(res, User?.id);
          return res.status(200).json({
            success: true,
            message: "user email login  successfully ",
          });
        }
      } else {
        console.log("checking admin log in .....");
        await isAdmin(
          req,
          res,
          next,
          "User login service is closed for now, connect exambuddy admin"
        );
      }
    } else {
      next();
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "User login service is closed for now",
    });
  }
};
