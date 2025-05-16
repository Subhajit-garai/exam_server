import { hashPasswordFn, veryfyhashPasswordFn } from "../../lib/hash";
import prisma from "../../db";
import { primeStatus, Prisma, UserRole } from "@prisma/client";
import {
  bot_creat_quiz_data_ZodSchema,
  bot_singupZodSchema,
  update_botwebhook_ZodSchema,
} from "../zod/bot.zod";
import { genToken, verifyToken } from "../../lib/token";
import { QuizeSetupFunction } from "../../lib/helper/TelegramQuiz";

export const test = async (req: any, res: any) => {
  try {
    res.json({ success: true, message: "message", data: "data" });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const AllUserData = async (req: any, res: any) => {
  try {
    let role = req.query.role;

    let users = await prisma.user.findMany({
      where:{
        role: role ?? "User"
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
    console.log("Error in metrix --->", error);
  }
};

export const IsprimeUser = async (req: any, res: any) => {
  try {
    let user_telegramid = req.query.telegramid;
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
    let isPrime = user.prime?.status == primeStatus.none ? false : true;

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

export const getQuizData = async (req: any, res: any) => {
  try {
    let data = bot_creat_quiz_data_ZodSchema.safeParse(req.body);
    

    if (!data.success) {
      return res.status(403).json({ success: false, message: "invalid data" });
    }
    let Notifystatus = await QuizeSetupFunction(req.bot_user, data.data);

    if (Notifystatus) {
      res.json({
        success: true,
        message: " quiz setup completed successfully",
      });
    } else {
      res.status(400).json({ success: false, message: "server error" });
    }
  } catch (error) {
    console.log("error in getQuizData in bot controller",error);
  }
};

export const getQuizTopic = async (req: any, res: any) => {
  try {
    let quiztype = req.query.quiztype;
    let response = await prisma.botQuizConfig.findFirst({});
    let data: {} | null = null;
    if (quiztype == "quiz") {
      data = {
        data: response?.quiztopic || null,
      };
    } else {
      data = {
        data: response?.rapidtopic || null,
        question_count: response?.question_count || null,
      };
    }
    return res.json({
      success: true,
      message: " topic sended successfully",
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
};

// admin

export const updateBotWebhook = async (req: any, res: any) => {
  try {
    let data = update_botwebhook_ZodSchema.safeParse(req.body);

    if (!data.success) {
      return res.status(400).json({
        success: false,
        message: "Input format/value invalid",
      });
    }

    let { bot_userid, name, newvalue, type } = data.data;

    let old_webhook_map = {
      webhook: {
        baseurl: "",
        endpoint: {},
      },
    };
    let old_webhook = await prisma.botInfo.findFirst({
      where: {
        botuser_id: bot_userid,
      },
    });

    if (!old_webhook?.webhook) {
      old_webhook_map.webhook = {
        baseurl: "",
        endpoint: {},
      };
    } else {
      old_webhook_map.webhook = old_webhook.webhook as any;
    }

    let newWebhookData = {};

    switch (type) {
      case "endpoint":
        if (!name) {
          return res.status(400).json({
            success: false,
            message: "Name is required",
          });
        }
        newWebhookData = {
          ...old_webhook_map.webhook, // Preserve existing structure
          endpoint: {
            ...old_webhook_map.webhook.endpoint, // Preserve other endpoints
            [name]: newvalue, // Update only the specified endpoint
          },
        };
        break;

      default:
        newWebhookData = {
          ...old_webhook_map.webhook, // Preserve existing structure
          baseurl: newvalue,
        };
    }

    let updated_webhook = await prisma.botInfo.update({
      where: {
        botuser_id: bot_userid,
      },
      data: {
        webhook: newWebhookData,
      },
    });

    res.json({
      success: true,
      message: "Webhook updated successfully",
      data: updated_webhook,
    });
  } catch (error) {
    console.error("Error in updateBotWebhook --->", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createNewBot = async (req: any, res: any) => {
  try {
    let data = bot_singupZodSchema.safeParse(req.body);

    if (!data.success) {
      return res.status(401).json({
        success: false,
        message: "bot credential format invalid ",
      });
    }

    let { name, email, password, telegramid, bottoken } = data.data;

    let isUserExist = await prisma.user.findUnique({
      where: {
        email: email,
        role: UserRole.Bot,
      },
    });

    if (isUserExist) {
      return res.status(409).json({
        success: false,
        message: "bot already exist , plz log in",
      });
    }
    const bot = await prisma.user.create({
      data: {
        name: name,
        email: email,
        role: UserRole.Bot,
        prime: {
          create: {
            status: primeStatus.none,
          },
        },
        telegram: {
          create: {
            telegramid: telegramid,
            last_update: new Date(),
          },
        },
        blance: {
          create: {
            amount: 1,
            ticket: 1,
            last_update: new Date(),
          },
        },
        verification: {
          create: {},
        },
        password: await hashPasswordFn(password),
      },
    });

    await prisma.progress.create({
      data: {
        userid: bot.id,
      },
    });

    await prisma.botInfo.create({
      data: {
        botuser_id: bot.id,
        token: bottoken,
        webhook: {
          baseurl: "",
          endpoint: {},
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "bot created sucessfully ",
      data: {
        name: bot.name,
        email: bot.email,
      },
    });
  } catch (error) {
    console.log("Error in bot creation --->", error);
  }
};

export const setQuizTopic = async (req: any, res: any) => {
  try {
    let data = req.body;
    let response = await prisma.botQuizConfig.create({
      data: {
        quiztopic: data.quiztopic,
        rapidtopic: data.rapidtopic,
        exam: data.exam,
        question_count: data.question_count,
      },
    });

    if (!response) {
      return res.json({
        success: false,
        message: " topic not set!, error occure",
        data: response,
      });
    }
    return res.json({ success: true, message: " topic set successfully" });
  } catch (error) {
    console.log(error);
  }
};

export const addbotToken = async (req: any, res: any) => {
  try {
    let token = req.body.token;
    let botuserID = req.body.id;
    // set zod validation

    token = await hashPasswordFn(token);

    //  console.log("token" ,token);

    let response = await prisma.botInfo.create({
      data: {
        token: token,
        botuser_id: botuserID,
      },
    });
    //  console.log("responce", response);

    if (response) {
      res.json({ success: true, message: "bot token set successfully" });
    }
  } catch (error) {
    console.log(error);
  }
};
