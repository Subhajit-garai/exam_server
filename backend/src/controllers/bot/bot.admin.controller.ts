import { hashPasswordFn } from "@/lib/security/hash.js";
import { bot_singupZodSchema, update_botwebhook_ZodSchema } from "@/zod/bot.zod.js";
import { BotService } from "../../services/bot.service.js";

const botService = new BotService();

export const updateBotWebhook = async (req: any, res: any) => {
  try {
    const validation = update_botwebhook_ZodSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Input format/value invalid",
      });
    }

    const { bot_userid, ...data } = validation.data;
    const updatedWebhook = await botService.admin.updateBotWebhook(bot_userid, data);

    res.json({
      success: true,
      message: "Webhook updated successfully",
      data: updatedWebhook,
    });
  } catch (error: any) {
    console.error("Error in updateBotWebhook --->", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const createNewBot = async (req: any, res: any) => {
  try {
    const validation = bot_singupZodSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(401).json({
        success: false,
        message: "bot credential format invalid ",
      });
    }

    const { password, ...data } = validation.data;
    const hashedPassword = await hashPasswordFn(password);

    try {
      const bot = await botService.admin.createBotUser(data, hashedPassword);
      res.status(200).json({
        success: true,
        message: "bot created sucessfully ",
        data: {
          name: bot.name,
          email: bot.email,
        },
      });
    } catch (e: any) {
      if (e.message.includes("already exist")) {
        return res.status(409).json({
          success: false,
          message: e.message,
        });
      }
      throw e;
    }

  } catch (error) {
    console.log("Error in bot creation --->", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const setQuizTopic = async (req: any, res: any) => {
  try {
    // Logic was commented out in original file
    return res.json({ success: true, message: " topic set successfully" });
  } catch (error) {
    console.log(error);
  }
};

export const addbotToken = async (req: any, res: any) => {
  try {
    let token = req.body.token;
    let botuserID = req.body.id;

    token = await hashPasswordFn(token);

    const response = await botService.admin.addBotToken(botuserID, token);

    if (response) {
      res.json({ success: true, message: "bot token set successfully" });
    }
  } catch (error) {
    console.log(error);
  }
};