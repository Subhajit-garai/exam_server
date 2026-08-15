import { asyncHandler } from "@/utils/asyncHandler.js";
import { verifyToken } from "@/utils/token.js";
import { db } from "@/db/index.js";
import { users } from "@/db/schema.js";
import { eq } from "drizzle-orm";

export const userauthenticate = asyncHandler(
  async (req: any, res: any, next: () => any) => {
    let token = req.cookies.token;
    if (!token) {
      throw new Error("Authentication token required");
    }

    let user = verifyToken(token);

    const userInfo = await db.query.users.findFirst({
      where: eq(users.id, user.id),
      columns: {
        id: true,
        role: true,
        exam_year_id: true,
        targeted_exam_id: true,
      },
    });

    if (!userInfo) {
      throw new Error("Authentication required ->");
    }

    req.user = user.id;
    req.userRole = userInfo.role;
    req.user_exam_year_id = userInfo.exam_year_id;
    req.user_targeted_exam_id = userInfo.targeted_exam_id;
    next();
  },
);

export const isAdmin = async (
  req: any,
  res: any,
  next: () => any,
  message: string = "Admin can access it!",
) => {
  try {
    if (req.userRole == "Admin") {
      next();
    } else {
      throw new Error(message);
    }
  } catch {
    throw new Error(message);
  }
};
