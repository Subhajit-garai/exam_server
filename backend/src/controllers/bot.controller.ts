import { hashPasswordFn } from "../../lib/hash";
import prisma from "../../db";


export const addbotToken  =async (req: any, res: any) => {
   try {
     let token = req.body.token;
     
     token = await hashPasswordFn(token);
 
    //  console.log("token" ,token);
     
     let response = await prisma.bottoken.create({
       data: {
         token: [token],
       },
     });
    //  console.log("responce", response);
     
     if (response) {
       res.json({ success: true, message: "bot token set successfully" });
     }
   } catch (error) {
     console.log(error);
     
   }
 }