import { asyncHandler } from "../helper/asyncHandler.js";
import { verifyToken } from "../token.js";
// import prisma from  "@repo/db/index";
import prisma from "@repo/db/index.js";

export const userauthenticate = asyncHandler(async (req: any, res: any, next: () => any) => {
  let token = req.cookies.token;
  if (!token) {
    throw new Error("Authentication token required");
  }

  let user = verifyToken(token);

  let userInfo = await prisma.user.findFirst({
    where: {
      id: user.id,
    },
    select: {
      id: true,
      role: true,
      exam_year_id: true,
      targeted_exam_id: true,
    },
  })
  if (!userInfo) {
    throw new Error("Authentication required");
  }


  req.user = user.id;
  req.userRole = userInfo.role;
  req.user_exam_year_id = userInfo.exam_year_id;
  req.user_targeted_exam_id = userInfo.targeted_exam_id;
  next();
})

export const isAdmin = async (
  req: any,
  res: any,
  next: () => any,
  message: string = "Admin can access it!"
) => {

  try {
    if (req.userRole == "Admin") {
      next();
    } else {
      throw new Error(message);
    }
  }
  catch {

    throw new Error(message);

  }

}
