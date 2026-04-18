import { setCookie } from "@repo/lib/token.js";
import {
  forgotpasswordVerifyZodSchema,
  forgotpasswordZodSchema,
  singinZodSchema,
  singupZodSchema,
  useremailValidationZodSchema,
  usertelegramidValidationZodSchema,
  validateTokenZodSchema,
  updateUserZodSchema,
} from "../zod/user.zod.js";
import { UserService } from "../services/user.service.js";
import { asyncHandler } from "@/lib/helper/asyncHandler.js";
import { ZodDataSafeParse } from "@/lib/ZodTypeChecker.js";
import { logger } from "@/lib/helper/logger.js";

const userService = new UserService();

export const userPurchases = async (req: any, res: any) => {
  try {
    let allPurchases = await userService.userPurchases(req.user);

    if (allPurchases) {
      console.log("allPurchases", allPurchases);

      res.json({
        success: true,
        message: "User all Purchases",
        data: allPurchases,
      });
    }
  } catch (error) {
    console.log("error in userpurchases", error);
    res.status(404).json({
      success: false,
      message: "Server error",
    });
  }
};

export const auth = asyncHandler(async (req: any, res: any) => {
  let User = await userService.auth(req.user);

  res.status(200).json({
    success: true,
    message: "User authenticated successfully",
    data: User,
  });

})

export const Logout = asyncHandler(async (req: any, res: any) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  console.log("user log out ", req.user);


  res.status(200).json({
    success: true,
    message: "Logged out",
  });
})

export const userSignup = asyncHandler(async (req: any, res: any) => {

  let processedData = singupZodSchema.safeParse(req.body);
  if (!processedData.success) {
    throw ZodDataSafeParse(processedData)
  }


  const newUser = await userService.userSignup(processedData.data);
  setCookie(res, newUser.id);

  res.status(200).json({
    success: true,
    message: "User created successfully",
    data: {
      name: newUser.name,
      email: newUser.email,
    },
  });
})

export const generateEmailValidationToken = asyncHandler(async (req: any, res: any) => {
  let processedData = useremailValidationZodSchema.safeParse(req.body);

  if (!processedData.success) {
    throw ZodDataSafeParse(processedData)
  }
  let { email } = processedData.data;
  await userService.generateEmailValidationToken(email);
  res.status(200).json({
    success: true,
    message: "Validation token sent to your email",
  });


})

export const verifyUserEmailValidationToken = asyncHandler(async (req: any, res: any) => {

  let processedData = validateTokenZodSchema.safeParse(req.body);

  if (!processedData.success) {
    throw ZodDataSafeParse(processedData)
  }

  let { token, email } = processedData.data;
  if (!email) throw Error("email not found ")
  const userId = await userService.verifyUserEmailValidationToken(token, email);

  setCookie(res, userId);


  res.status(200).json({
    success: true,
    message: "Email validated successfully",
  });
})

export const generateUserTelegramIdValidationToken = asyncHandler(async (req: any, res: any) => {

  let processedData = usertelegramidValidationZodSchema.safeParse(req.body);

  if (!processedData.success) {
    throw ZodDataSafeParse(processedData)
  }

  let { telegramid } = processedData.data;
  await userService.generateUserTelegramIdValidationToken(req.user, telegramid);
  return res.status(200).json({
    success: true,
    message: "Validation token sent to your Telegram",
  });

})

export const verifyUserTelegramIdValidationToken = asyncHandler(async (
  req: any,
  res: any
) => {

  let processedData = validateTokenZodSchema.safeParse(req.body);

  if (!processedData.success) {
    throw ZodDataSafeParse(processedData)
  }
  let { token } = processedData.data;
  await userService.verifyUserTelegramIdValidationToken(req.user, token);

  res.status(200).json({
    success: true,
    message: "Telegram ID verified successfully",
  });
})

export const generateUserForgotPasswordToken = asyncHandler(async (req: any, res: any) => {
  let processedData = forgotpasswordZodSchema.safeParse(req.body);

  if (!processedData.success) {
    throw ZodDataSafeParse(processedData)
  }
  let { email } = processedData.data;
  await userService.generateUserForgotPasswordToken(email);
  res.status(200).json({
    success: true,
    message: "Password reset token sent to your email",
  });
})




export const verifyUserForgotPasswordToken = asyncHandler(async (req: any, res: any) => {
  let processedData = forgotpasswordVerifyZodSchema.safeParse(req.body);

  if (!processedData.success) {
    throw ZodDataSafeParse(processedData)
  }
  await userService.verifyUserForgotPasswordToken(processedData.data);
  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

export const userSignin = asyncHandler(async (req: any, res: any) => {

  let processedData = singinZodSchema.safeParse(req.body);

  if (!processedData.success) {
    throw ZodDataSafeParse(processedData)
  }
  let User = await userService.userSignin(processedData.data);
  res.status(200).json({
    success: true,
    message: "User needs to verify their email. ",
    email: User.email,
  });
});


export const updateUser = asyncHandler(async (req: any, res: any) => {
  let processedData = updateUserZodSchema.safeParse(req.body);

  if (!processedData.success) {
    throw ZodDataSafeParse(processedData)
  }
  const updatedUser = await userService.updateUser(req.user, processedData.data);

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: updatedUser,
  });
});

export const getUserTimeline = asyncHandler(async (req: any, res: any) => {

  const timeline = await userService.getUserTimeline(req.user);
  res.status(200).json({
    success: true,
    data: timeline,
    message: "User timeline fetched successfully",
  });



})
export const getSubscriptionTiers = asyncHandler(async (req: any, res: any) => {
  const tiers = await userService.getSubscriptionTiers();
  res.status(200).json({
    success: true,
    data: tiers,
    message: "Subscription tiers fetched successfully",
  });
});

export const getUserSubscriptionDetails = asyncHandler(async (req: any, res: any) => {
  const details = await userService.getUserSubscriptionDetails(req.user);
  res.status(200).json({
    success: true,
    data: details,
    message: "User subscription details fetched successfully",
  });
});
