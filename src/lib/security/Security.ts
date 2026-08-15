import { db } from "@/db/index.js";
import { app_configs, users } from "@/db/schema.js";
import { eq } from "drizzle-orm";

import { z } from "zod";
import { isAdmin } from "./auth.js";
import { setCookie } from "../../utils/token.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { CustomError } from "@/middleware/globalErrorHandler.js";
import { logger } from "@/utils/logger.js";

const settingsSchema = z.object({
  status: z.string(),
});

export const IsPurchasesOpen = async (req: any, res: any, next: () => any) => {
  try {
    const config = await db.query.app_configs.findFirst({
      where: eq(app_configs.feature, "token-purchases"),
      columns: {
        settings: true,
      },
    });

    const parsedSettings = settingsSchema.safeParse(config?.settings);

    if (parsedSettings.success && parsedSettings.data.status === "open") {
      next();
    } else {
      return res.status(401).json({
        success: false,
        message:
          "Token purchases are currently closed. Please contact the admin for more information. We’ll notify you once they reopen.",
      });
    }
  } catch (error) {
    logger.error("error", error);

    return res.status(401).json({
      success: false,
      message: "User login service is closed for now",
    });
  }
};

export const IsUserSignUpOpen = async (req: any, res: any, next: () => any) => {
  try {
    const config = await db.query.app_configs.findFirst({
      where: eq(app_configs.feature, "user-signup"),
      columns: {
        settings: true,
      },
    });

    const parsedSettings = settingsSchema.safeParse(config?.settings);

    if (parsedSettings.success && parsedSettings.data.status === "open") {
      next();
    } else {
      logger.warn("User signup service is closed");
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

export const IsCouponOpen = asyncHandler(
  async (req: any, res: any, next: () => any) => {
    const config = await db.query.app_configs.findFirst({
      where: eq(app_configs.feature, "use-coupon"),
      columns: {
        settings: true,
      },
    });

    const parsedSettings = settingsSchema.safeParse(config?.settings);

    if (parsedSettings.success && parsedSettings.data.status === "open") {
      next();
    } else {
      throw new CustomError("Coupon service is closed for now", 401);
    }
  },
);

export const IsUserLoginOpen = async (req: any, res: any, next: () => any) => {
  try {
    const config = await db.query.app_configs.findFirst({
      where: eq(app_configs.feature, "user-login"),
      columns: {
        settings: true,
      },
    });

    const parsedSettings = settingsSchema.safeParse(config?.settings);

    if (parsedSettings.success && parsedSettings.data.status === "open") {
      next();
    } else {
      logger.info("Checking admin login...");
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
  next: () => any,
) => {
  try {
    let { email, password } = req.body;

    if (email === process.env.RAZORPAY_TESTACCESS_USER_EMAIL?.trim()) {
      logger.info("razorpay accessing ....");

      const settings = await db.query.app_configs.findFirst({
        where: eq(app_configs.feature, "razorpay-testaccess"),
      });

      const parsedSettings = settingsSchema.safeParse(settings?.settings);

      if (parsedSettings.success && parsedSettings.data.status === "open") {
        if (password === process.env.RAZORPAY_TESTACCESS_PASSWORD?.trim()) {
          const userData = await db.query.users.findFirst({
            where: eq(users.email, email),
            columns: {
              id: true,
            },
          });

          if (!userData)
            return res.status(404).json({
              success: true,
              message: "user not found",
            });
          setCookie(res, userData.id);
          return res.status(200).json({
            success: true,
            message: "user email login successfully ",
          });
        }
      } else {
        logger.info("Checking admin login...");
        await isAdmin(
          req,
          res,
          next,
          "User login service is closed for now, connect exambuddy admin",
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
