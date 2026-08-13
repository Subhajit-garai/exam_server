import { appConfigSetting_zodSchema } from "@/zod/settings.zod.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { ZodDataSafeParse } from "@/utils/ZodTypeChecker.js";
import { SettingsService } from "./service.js";

const settingsService = new SettingsService();

export const test = asyncHandler(async (req: any, res: any) => {
  res.json({ success: true, message: "message", data: "data" });
});

export const getAllbotUser = asyncHandler(async (req: any, res: any) => {
  const bots = await settingsService.getAllBotUsers();
  res.json({ success: true, message: "message", data: bots });
});

export const SendAppConfig = asyncHandler(async (req: any, res: any) => {
  let settings = await settingsService.getAppConfig();
  res.json({ success: true, message: "setting sended", data: settings });
});

export const updateAppConfig = asyncHandler(async (req: any, res: any) => {
  let processedData = appConfigSetting_zodSchema.safeParse(req.body);

  if (!processedData.success) {
    throw ZodDataSafeParse(processedData);
  }

  let { feature, status } = processedData.data;

  let updateSetting = await settingsService.updateAppConfig(feature, status);

  res.json({
    success: true,
    message: "setting updated successful",
    data: updateSetting,
  });
});
