import { setCookie } from "@repo/lib/token.js";
import {
  forgotpasswordVerifyZodSchema,
  forgotpasswordZodSchema,
  singinZodSchema,
  singupZodSchema,
  useremailValidationZodSchema,
  usertelegramidValidationZodSchema,
  validateTokenZodSchema,
} from "../zod/user.zod.js";
import { UserService } from "../services/user.service.js";

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

export const auth = async (req: any, res: any) => {
  try {
    let User = await userService.auth(req.user);

    res.status(200).json({
      success: true,
      message: "user created sucessfully ",
      data: User,
    });
  } catch (error) {
    console.log("Error in auth", error);

    res.status(401).json({
      success: false,
      message: "token not send , plz try again  ",
    });
  }
};

export const Logout = async (req: any, res: any) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Logged out",
    });
  } catch (error) {
    console.log(error);
  }
};

export const userSignup = async (req: any, res: any) => {
  try {
    let data = singupZodSchema.safeParse(req.body);

    if (!data.success) {
      return res.status(401).json({
        success: false,
        message: "user credential format invalid ",
      });
    }

    try {
      const newUser = await userService.userSignup(data.data);
      setCookie(res, newUser.id);

      res.status(200).json({
        success: true,
        message: "user created sucessfully ",
        data: {
          name: newUser.name,
          email: newUser.email,
        },
      });
    } catch (error: any) {
      if (error.message === "user already exist") {
        return res.status(409).json({
          success: false,
          message: "user already exist , plz log in",
        });
      }
      throw error;
    }
  } catch (error) {
    console.log("Error in userSignup", error);

    res.status(401).json({
      success: false,
      message: "token not send , plz try again  ",
    });
  }
};

export const useremailValidationTokengen = async (req: any, res: any) => {
  try {
    let data = useremailValidationZodSchema.safeParse(req.body);

    if (!data.success) {
      return res.status(401).json({
        success: false,
        message: "user credential format invalid ",
      });
    }

    let { email } = data.data;

    try {
      await userService.useremailValidationTokengen(email);
      res.status(200).json({
        success: true,
        message: "validation  token send successfully on your email ",
      });
    } catch (error: any) {
      if (error.message === "user not exist") {
        return res.status(404).json({
          success: false,
          message: "user not exist , plz signup",
        });
      }
      console.log("Error sending email", error);
      res.status(401).json({
        success: false,
        message: "token not send , plz try again  ",
      });
    }
  } catch (error) {
    console.log("Error in useremailValidationTokengen", error);

    res.status(401).json({
      success: false,
      message: "token not send , plz try again  ",
    });
  }
};

export const useremailValidationTokenVerify = async (req: any, res: any) => {
  try {
    let data = validateTokenZodSchema.safeParse(req.body);

    if (!data.success) {
      return res.status(401).json({
        success: false,
        message: "user credential format invalid ",
      });
    }

    try {
      let { token, email } = data.data;
      if (!email) throw Error("email not found ")
      const userId = await userService.useremailValidationTokenVerify(token, email, req.user);

      setCookie(res, userId);

      res.status(200).json({
        success: true,
        message: "user email validate  successfully ",
      });
    } catch (error: any) {
      if (error.message === "user not exist token expired") {
        return res.status(404).json({
          success: false,
          message: "user not exist token expired , generate new one",
        });
      }
      if (error.message === "user not exist") {
        return res.status(404).json({
          success: false,
          message: "user not exist , plz signup now ",
        });
      }
      throw error;
    }
  } catch (error) {
    console.log("-------------> ", error);

    return res.status(404).json({
      success: false,
      message: "Server Error , Try again later ",
    });
  }
};

export const usertelegramidValidationTokengen = async (req: any, res: any) => {
  try {
    let data = usertelegramidValidationZodSchema.safeParse(req.body);

    if (!data.success) {
      return res.status(401).json({
        success: false,
        message: "user credential format invalid ",
      });
    }

    let { telegramid } = data.data;

    try {
      await userService.usertelegramidValidationTokengen(req.user, telegramid);
      return res.status(200).json({
        success: true,
        message: "validation  token send successfully on your email ",
      });
    } catch (error: any) {
      if (error.message === "user not exist") {
        return res.status(404).json({
          success: false,
          message: "user not exist , plz signup",
        });
      }
      if (error.message === "user telegram id not match") {
        return res.status(404).json({
          success: false,
          message:
            "user telegram id not match, plz provide correct one Or plz signup  ",
        });
      }
      if (error.message === "token not send") {
        return res.status(401).json({
          success: false,
          message: "token not send , plz try again 2 ",
        });
      }
      throw error;
    }
  } catch (error) {
    console.log("Error sending token", error);

    res.status(401).json({
      success: false,
      message: "token not send , plz try again  ",
    });
  }
};

export const usertetegramidValidationTokenVerify = async (
  req: any,
  res: any
) => {
  try {
    let data = validateTokenZodSchema.safeParse(req.body);

    if (!data.success) {
      return res.status(401).json({
        success: false,
        message: "user credential format invalid ",
      });
    }

    try {
      let { token } = data.data;
      await userService.usertetegramidValidationTokenVerify(req.user, token);

      res.status(200).json({
        success: true,
        message: "user password change successfully ",
      });
    } catch (error: any) {
      if (error.message === "user not exist or token expired") {
        return res.status(404).json({
          success: false,
          message: "user not exist , plz signup now ",
        });
      }
      throw error;
    }
  } catch (error) {
    console.log("Error in usertetegramidValidation", error);

    return res.status(404).json({
      success: false,
      message: "Server Error , Try again later ",
    });
  }
};

export const userForgotpasswordTokenGen = async (req: any, res: any) => {
  try {
    let data = forgotpasswordZodSchema.safeParse(req.body);

    if (!data.success) {
      return res.status(401).json({
        success: false,
        message: "user credential format invalid ",
      });
    }

    let { email } = data.data;

    try {
      await userService.userForgotpasswordTokenGen(email);
      res.status(200).json({
        success: true,
        message: "pasword reset token send successfully on your email ",
      });
    } catch (error: any) {
      if (error.message === "user not exist") {
        return res.status(404).json({
          success: false,
          message: "user not exist , plz signup  ",
        });
      }
      console.log(error);
      res.status(401).json({
        success: false,
        message: "token not send , plz try again  ",
      });
    }
  } catch (error) {
    console.log("Error in userForgotpasswordTokenGen", error);

    res.status(401).json({
      success: false,
      message: "token not send , plz try again  ",
    });
  }
};

export const userForgotpasswordTokenVerify = async (req: any, res: any) => {
  try {
    let data = forgotpasswordVerifyZodSchema.safeParse(req.body);

    if (!data.success) {
      return res.status(401).json({
        success: false,
        message: "user credential format invalid ",
      });
    }

    try {
      await userService.userForgotpasswordTokenVerify(data.data);
      res.status(200).json({
        success: true,
        message: "user password change successfully ",
      });
    } catch (error: any) {
      if (error.message === "user not exist or token expired") {
        return res.status(404).json({
          success: false,
          message: "user not exist , plz signup now ",
        });
      }
      throw error;
    }
  } catch (error) {
    console.log("Error in userForgotpasswordTokenVerify", error);

    res.status(401).json({
      success: false,
      message: "token not send , plz try again  ",
    });
  }
};

export const userSignin = async (req: any, res: any) => {
  try {
    let data = singinZodSchema.safeParse(req.body);

    if (!data.success) {
      return res.status(401).json({
        success: false,
        message: "user credential format invalid ",
      });
    }

    try {
      let User = await userService.userSignin(data.data);

      // setCookie(res, User.id); // remove this 

      res.status(200).json({
        success: true,
        message: "User needs to verify their email. ",
        email: User.email,
      });
    } catch (error: any) {
      if (error.message === "user not exist") {
        return res.status(404).json({
          success: false,
          message: "user not exist , plz signup now ",
        });
      }
      if (error.message === "credientile incurrect") {
        return res.status(401).json({
          success: false,
          message: "credientile incurrect  , plz signup/sign in  ",
        });
      }
      throw error;
    }
  } catch (error) {
    console.log("Error in user sign in", error);
    res.status(401).json({
      success: false,
      message: "token not send , plz try again  ",
    });
  }
};
