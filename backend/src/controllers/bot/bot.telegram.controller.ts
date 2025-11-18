import { veryfyhashPasswordFn } from "@/lib/security/hash";
import { genToken } from "@/lib/token";
import prisma from "@repo/db/index";
import { primeStatus, UserRole } from "@repo/prisma/client";




export const sendAlluser = async (req: any, res: any) => {
  try {
    let users = await prisma.user.findMany({
      select: {
        telegram: {
          select: { telegramid: true },
        },
        prime: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!users) {
      return res.status(403).json({
        success: false,
        message: "user not found",
      });
    }
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
    let groupDatas = await prisma.telegramGroupInfo.findMany({
      select: {
        groupid: true,
        groupType: true,
        isBanned: true,
        isPremium: true,
      },
    });

    let formatedValidChatIds: Object[] = [];

    groupDatas.map((groupData) => {
      if (!groupData.isBanned) {
        let tempdata = {
          id: groupData.groupid,
          type: groupData.groupType,
          isPremium: groupData.isPremium,
        };

        formatedValidChatIds.push(tempdata);
      }
    });
    res.json({ success: true, message: "message", data: formatedValidChatIds });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};
export const sendGroupTopicinfo = async (req: any, res: any) => {
  try {
    let { groupId, name } = req.query;

    let groupTopicInfo = await prisma.telegramGroupTopic.findFirst({
      where: {
        id: groupId,
        name: name,
      },
    });

    if (!groupTopicInfo) throw Error(" group topic info not avalible ");

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
    let group_telegramid = req.query.chatid;

    let groupInfo = await prisma.telegramGroupInfo.findFirst({
      where: {
        groupid:
          typeof group_telegramid !== "string"
            ? String(group_telegramid)
            : group_telegramid,
      },
    });
    res.json({ success: true, message: "message", data: groupInfo });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};
export const isGroupJoinable = async (req: any, res: any) => {
  try {
    let group_telegramid = req.query.chatid;

    let groupInfo = await prisma.telegramGroupInfo.findFirst({
      where: {
        groupid:
          typeof group_telegramid !== "string"
            ? String(group_telegramid)
            : group_telegramid,
      },
    });

    let isjoinable = groupInfo?.isBanned == false ? true : false;
    res.json({ success: true, message: "message", data: isjoinable });
  } catch (error) {
    console.log("Error in bot.controller (in isgroupjoinable)  --->", error);
  }
};
export const AllUserData = async (req: any, res: any) => {
  try {
    let role = req.query.role;

    let users = await prisma.user.findMany({
      where: {
        role: role ?? "User",
      },
      select: {
        telegram: {
          select: {
            telegramid: true,
          },
        },
        prime: {
          select: {
            status: true,
            expiry: true,
          },
        },
      },
    });

    if (!users) {
      return res
        .status(404)
        .json({ success: false, message: "no user found " });
    }
    res.json({ success: true, message: "success ", data: users });
  } catch (error) {
    console.log("Error in bot.controller (in allUserdata) --->", error);
  }
};
export const IsprimeUser = async (req: any, res: any) => {
  try {
    let user_telegramid = req.query.userid;
    let user = await prisma.user.findFirst({
      where: {
        telegram: {
          telegramid: user_telegramid,
        },
      },
      select: {
        prime: {
          select: {
            status: true,
          },
        },
      },
    });
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "user not found",
      });
    }
    let isPrime = user.prime?.status == primeStatus.None ? false : true;

    res.json({ success: true, message: "is user prime ", data: isPrime });
  } catch (error) {
    console.log("Error in IsprimeUser --->", error);
  }
};
export const bot_login = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    let responce = await prisma.user.findFirst({
      where: { email: email, role: UserRole.Bot },
      select: { id: true, password: true },
    });

    if (!responce) {
      throw new Error("bot_login not found");
    }

    let isVerified = veryfyhashPasswordFn(password, responce?.password);

    if (!isVerified) {
      res.status(403).json({ success: false, message: "bot not verified" });
    }
    let newToken = genToken(responce.id);
    res.json({ success: true, message: "successful", data: newToken });
  } catch (error) {
    console.log("Error in bot login --->", error);
  }
};