import { hashPasswordFn, veryfyhashPasswordFn } from "../../lib/hash";
import prisma from "../../db/index";
import { verifyToken } from "../../lib/token";

const verifyBotToken = async (bot_userid: string, token: string) => {
  let hashtoken = await prisma.botInfo.findFirst({
    where: { id: bot_userid },
    select: { token: true },
  });

  if (!hashtoken) {
    return false;
  }

  let status = await veryfyhashPasswordFn(token, hashtoken.token); // hash password
  if (status) {
    return true;
  }

  return false;
};

export const botauthenticate = async (req: any, res: any, next: () => any) => {
  let token = req.headers.authorization;
  // bot user jwt &&  bot token
  
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required" });
  }
  try {
    let bot = verifyToken(token); // jwt 
    req.bot_user = bot;
    if (!bot) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
    }
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
