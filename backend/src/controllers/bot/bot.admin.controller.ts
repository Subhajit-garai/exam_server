import { hashPasswordFn } from "@/lib/security/hash";
import { bot_singupZodSchema, update_botwebhook_ZodSchema } from "@/zod/bot.zod";
import prisma from "@repo/db/index";
import { primeStatus, UserRole } from "@repo/prisma/client";





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
            status: primeStatus.None,
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
    // let response = await prisma.botQuizConfig.create({
    //   data: {
    //     quiztopic: data.quiztopic,
    //     rapidtopic: data.rapidtopic,
    //     exam: data.exam,
    //     question_count: data.question_count,
    //   },
    // });

    // if (!response) {
    //   return res.json({
    //     success: false,
    //     message: " topic not set!, error occure",
    //     data: response,
    //   });
    // }
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