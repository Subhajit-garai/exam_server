import { ResponseType } from "axios";
import { verifyToken } from "./token";

import prisma from "../db";
import { Request, Response } from "express";

export const userauthenticate = (req: any, res: any, next: () => any) => {
  let token = req.cookies.token;  
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required" });
  }
  try {
    let user = verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};


export const isAdmin = async(req:any , res:any ,next: ()=> any) =>{
  try {
    let userid = req?.user
    let user  = await prisma.user.findUnique({
      where:{
        id:userid
      }
    })
    if (user){
        if(user.role == "Admin"){ //// remove (user.role == "User") , unless it give access admin 's power to all user 
          next();
        }
        else{

          throw new Error("Admin can access it!")
        }
    }
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: error });
  }
}