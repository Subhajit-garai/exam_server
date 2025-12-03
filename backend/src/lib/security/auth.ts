import { verifyToken } from "../token.js";
// import prisma from  "@repo/db/index";
import prisma from "@repo/db/index.js";

export const userauthenticate = (req: any, res: any, next: () => any) => {
  let token = req.cookies.token;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required" });
  }
  try {
    let user = verifyToken(token);
    req.user = user.id;
    req.userRole = "User";
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

export const isAdmin = async (
  req: any,
  res: any,
  next: () => any,
  message = "Admin can access it!"
) => {
  try {
    // with token
    let user: any

    if (req.user) {
      user = await prisma.user.findFirst({
        where: {
          id: req.user,
        },
        select: {
          id: true,
          role: true,
        },
      });

    } else {
      user = await prisma.user.findFirst({
        where: {
          email: req.body.email,
        },
        select: {
          id: true,
          role: true,
        },
      });

    }
    if (user) {
      if (user.role == "Admin") {
        req.userRole = "Admin";
        next();
      } else {
        throw new Error(message);
      }
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }
  } catch (error) {
    return res.status(401).json({ success: false, message: message ?? "Authentication required" });
  }
};
