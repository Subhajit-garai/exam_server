import prisma from "@repo/db/index.js";
import { appConfigSetting_zodSchema } from "../zod/settings.zod.js";
import { asyncHandler } from "@/lib/helper/asyncHandler.js";
import { ZodDataSafeParse } from "@/lib/ZodTypeChecker.js";

export const test = asyncHandler(async (req: any, res: any) => {
  res.json({ success: true, message: "message", data: "data" });
});

export const getAllbotUser = asyncHandler(async (req: any, res: any) => {
  let bots = await prisma.botInfo.findMany({
    select: {
      User: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!bots) {
    throw Error("no bot user found");
  }
  res.json({ success: true, message: "message", data: bots });
});

export const SendAppConfig = asyncHandler(async (req: any, res: any) => {
  let settings = await prisma.appConfig.findMany({});
  res.json({ success: true, message: "setting sended", data: settings });
});

export const updateAppConfig = asyncHandler(async (req: any, res: any) => {
  let processedData = appConfigSetting_zodSchema.safeParse(req.body);

  if (!processedData.success) {
    throw ZodDataSafeParse(processedData);
  }

  let { feature, status } = processedData.data;

  let updateSetting = await prisma.appConfig.update({
    where: {
      feature: feature,
    },
    data: {
      settings: { status: status },
    },
  });

  if (!updateSetting) {
    return res
      .status(404)
      .json({ success: false, message: "setting not updated " });
  }

  res.json({
    success: true,
    message: "setting updated successful",
    data: updateSetting,
  });
});
