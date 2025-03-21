import { hashPasswordFn, veryfyhashPasswordFn } from "../../lib/hash";
import prisma from "../../db/index"

let BOT_TOKEN:string[]= [];

const verifyBotToken = async(token: string) => {

    if (BOT_TOKEN.length < 1){

        let tokens = await prisma.bottoken.findMany({select:{token:true}})
        BOT_TOKEN = tokens.map((item:any)=> item.token).flat()
    }
    for (const hashtoken of BOT_TOKEN) {

      let status = await veryfyhashPasswordFn(token, hashtoken);
      if (status) {
        return true;
      }
    }
 
  return false;
};

export const botauthenticate = async(req: any, res: any, next: () => any) => {  
  let token = req.headers.token;
  // bot user jwt &&  bot token
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required" });
  }
  try {
    let bot = await verifyBotToken(token);
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