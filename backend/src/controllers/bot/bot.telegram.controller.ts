import { veryfyhashPasswordFn } from "@/lib/security/hash.js";
import { genToken } from "@/lib/token.js";
import prisma from "@repo/db/index.js";
import { UserRole } from "@repo/prisma/client.js";
import { BotService } from "../../services/bot.service.js";
import { asyncHandler } from "@/lib/helper/asyncHandler.js";

const botService = new BotService();

export const sendAlluser = async (req: any, res: any) => {
  try {
    const users = await botService.telegram.getAllUsersForTelegram();
    res.json({ success: true, message: "sending users", users: users });
  } catch (error) {
    console.log("Error in bot.controller sendAlluser  --->", error);
    return res.status(400).json({
      success: false,
      message: "server error",
    });
  }
};

export const sendValidchatids = async (req: any, res: any) => {
  try {
    const data = await botService.telegram.getValidChatIds();
    res.json({ success: true, message: "message", data: data });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const sendGroupTopicinfo = async (req: any, res: any) => {
  try {
    const { groupId, name } = req.query;
    const groupTopicInfo = await botService.telegram.getGroupTopicInfo(groupId, name);
    return res.json({
      success: true,
      message: "message",
      data: groupTopicInfo,
    });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const sendGroupinfo = async (req: any, res: any) => {
  try {
    const group_telegramid = req.query.chatid;
    const chatid = typeof group_telegramid !== "string" ? String(group_telegramid) : group_telegramid;

    const groupInfo = await botService.telegram.getGroupInfo(chatid);
    res.json({ success: true, message: "message", data: groupInfo });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const isGroupJoinable = async (req: any, res: any) => {
  try {
    const group_telegramid = req.query.chatid;
    const chatid = typeof group_telegramid !== "string" ? String(group_telegramid) : group_telegramid;

    const isjoinable = await botService.telegram.isGroupJoinable(chatid);
    res.json({ success: true, message: "message", data: isjoinable });
  } catch (error) {
    console.log("Error in bot.controller (in isgroupjoinable)  --->", error);
  }
};

export const AllUserData = asyncHandler(async (req: any, res: any) => {
  const role = req.query.role;
  const users = await botService.telegram.getUsersByRole(role);
  res.json({ success: true, message: "success ", data: users });

})

export const IsprimeUser = asyncHandler(async (req: any, res: any) => {

  const user_telegramid = req.query.userid;
  const isPrime = await botService.telegram.isPrimeUser(user_telegramid);
  res.json({ success: true, message: "is user prime ", data: isPrime });
})

export const bot_login = asyncHandler(async (req: any, res: any) => {

  const newToken = await botService.admin.botLogin(req.body);
  res.json({ success: true, message: "successful", data: newToken });
})

export const processNotification = asyncHandler(async (req: any, res: any) => {

  const type = req.query.type;
  const data = req.body;
  const botUserId = req.bot_user.id;

  const result = await botService.telegram.processNotification(type, data, botUserId);
  res.json({ success: true, ...result });
})