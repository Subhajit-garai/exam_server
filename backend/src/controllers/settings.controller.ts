import prisma from "../../db";
import { bot_singupZodSchema } from "../zod/bot.zod";
import { appConfigSetting_zodSchema } from "../zod/settings.zod";

export const test = async (req: any, res: any) => {
  try {
    res.json({ success: true, message: "message", data: "data" });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};
export const SendAppConfig = async (req: any, res: any) => {
  try {

    let settings =  await prisma.appConfig.findMany({})    
    res.json({ success: true, message: "setting sended", data: settings });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const updateAppConfig = async (req: any, res: any) => {
  try {
        
    let data = appConfigSetting_zodSchema.safeParse(req.body);
    if (!data.success) {
      return res.status(403).json({ success: false, message: "invalid data" });
    }
    let { feature, status } = data.data;

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
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};
