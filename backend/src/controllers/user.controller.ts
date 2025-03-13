import { genToken, setCookie } from "../../lib/token";
import { primeStatus } from "@prisma/client";
import prisma from "../../db";
import {
  Createhash,
  generateResetToken,
  hashPasswordFn,
  veryfyhashPasswordFn,
} from "../../lib/hash";
import {
  forgotpasswordVerifyZodSchema,
  forgotpasswordZodSchema,
  singinZodSchema,
  singupZodSchema,
  useremailValidationZodSchema,
  usertelegramidValidationZodSchema,
  validateTokenZodSchema,
} from "../zod/user.zod";
import Mailer from "../../lib/messageService/nodemail";
import dayjs from "dayjs";
import { sendMessage_HtmlParse } from "../../lib/messageService/telgramMessenger";

export const userPurchases = async (req: any, res: any) => {
  try {
    let User = await prisma.user.findFirst({
      where: {
        id: req.user,
      },
    });
    if (!User) {
      return res.status(401).json({
        success: false,
        message: "user not exist , plz log in ",
      });
    }

    let allPurchases = await prisma.payment.findMany({
      where: {
        userId: User.id,
      },
    });

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
    let User = await prisma.user.findFirst({
      where: {
        id: req.user,
      },
      select: {
        name: true,
        email: true,
        blance: {
          select: {
            amount: true,
            ticket: true,
          },
        },
        prime: {
          select: {
            status: true,
          },
        },
        verification: {
          select: {
            email: true,
            telegram: true,
            whatsapp: true,
          },
        },
        telegram: {
          select: {
            telegramid: true,
          },
        },
      },
    });

    if (!User) {
      return res.status(401).json({
        success: false,
        message: "user not exist , plz log in ",
      });
    }

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

    let { name, email, password, telegramid } = data.data;

    let isUserExist = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (isUserExist) {
      return res.status(409).json({
        success: false,
        message: "user already exist , plz log in",
      });
    }

    const hasspaword = await hashPasswordFn(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        prime: {
          create: {
            status: primeStatus.none,
          },
        },
        telegram: {
          create: {
            telegramid: telegramid || "123456790",
            last_update: new Date(),
          },
        },
        blance: {
          create: {
            amount: 10,
            ticket: 1,
            last_update: new Date(),
          },
        },
        verification: {
          create: {},
        },
        password: hasspaword,
      },
    });

    await prisma.progress.create({
      data: {
        userid: newUser.id,
      },
    });

    // validate user or remove user
    const referer = req.get("Referer");

    // send user an email for validation

    setCookie(res, newUser.id);

    res.status(200).json({
      success: true,
      message: "user created sucessfully ",
      data: {
        name: newUser.name,
        email: newUser.email,
      },
    });
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

    let User = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!User) {
      return res.status(404).json({
        success: false,
        message: "user not exist , plz signup",
      });
    }
    // generate token and send to user email

    // generate token
    let { token, hashedToken } = generateResetToken("email");
    const expirationDate: Date = dayjs().add(10, "minute").toDate();
    console.log("expirationDate", expirationDate);

    let update = await prisma.user.update({
      where: {
        id: User.id,
      },
      data: {
        forgotpasswordToken: hashedToken,
        resetTokenExpires: expirationDate, // 10 min life  of token
      },
    });

    if (!update) {
      return res.status(401).json({
        success: false,
        message: "token not set , plz try again  ",
      });
    }

    // send token to user email

    let mailer = new Mailer();
    await mailer
      .sendMail(
        email,
        "User email validation",
        `Your validation token is ${token}`
      )
      .then(() => {
        res.status(200).json({
          success: true,
          message: "validation  token send successfully on your email ",
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(401).json({
          success: false,
          message: "token not send , plz try again  ",
        });
      });
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

    let transtion = await prisma.$transaction(async (tx: any) => {
      let { token } = data.data;
      let token_hash = Createhash(token);

      let User = await tx.user.findUnique({
        where: {
          id: req.user,
          forgotpasswordToken: token_hash,
        },
      });

      if (User) {
        if (User?.resetTokenExpires < new Date()) {
          return res.status(404).json({
            success: false,
            message: "user not exist , plz signup now ",
          });
        }
      }

      await tx.user.update({
        where: {
          id: req.user,
        },
        data: {
          forgotpasswordToken: "-1",
        },
      });

      await tx.verification.update({
        where: {
          id: User?.verificationid as string,
        },
        data: {
          email: true,
        },
      });

      res.status(200).json({
        success: true,
        message: "user email validate  successfully ",
      });
    });
  } catch (error) {
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
    let User = await prisma.user.findUnique({
      where: {
        id: req.user,
      },
      select: {
        id: true,
        telegram: {
          select: {
            telegramid: true,
          },
        },
      },
    });

    if (!User) {
      return res.status(404).json({
        success: false,
        message: "user not exist , plz signup",
      });
    }

    if (User?.telegram?.telegramid !== telegramid) {
      console.log("user ", User?.telegram?.telegramid);
      console.log("telegramid ", telegramid);

      return res.status(404).json({
        success: false,
        message:
          "user telegram id not match, plz provide correct one Or plz signup  ",
      });
    }

    // generate token
    let { token, hashedToken } = generateResetToken("telegramid");
    const expirationDate: Date = dayjs().add(10, "minute").toDate();

    let update = await prisma.user.update({
      where: {
        id: User.id,
      },
      data: {
        forgotpasswordToken: hashedToken,
        resetTokenExpires: expirationDate, // 10 min life  of token
      },
    });

    if (!update) {
      return res.status(401).json({
        success: false,
        message: "token not set , plz try again 1 ",
      });
    }

    // send token to user telegram
    const MESSAGE = `
<b>🔑 Your Access Token</b>

<code>${token}</code>

⚠️ <i>Do not share this token with anyone.</i>
⚠️ <i>You can hold the token to copy it.</i>
`;
    let message_state = await sendMessage_HtmlParse(
      parseInt(telegramid),
      MESSAGE
    );

    if (message_state) {
      return res.status(200).json({
        success: true,
        message: "validation  token send successfully on your email ",
      });
    } else {
      console.log("---->", message_state);

      return res.status(401).json({
        success: false,
        message: "token not send , plz try again 2 ",
      });
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

    let transtion = await prisma.$transaction(async (tx: any) => {
      let { token } = data.data;
      let token_hash = Createhash(token);

      let User = await tx.user.findUnique({
        where: {
          id: req.user,
          forgotpasswordToken: token_hash,
        },
      });

      if (!User || User?.resetTokenExpires < new Date()) {
        return res.status(404).json({
          success: false,
          message: "user not exist , plz signup now ",
        });
      }

      await tx.user.update({
        where: {
          id: req.user,
        },
        data: {
          forgotpasswordToken: "-1",
        },
      });

      await tx.verification.update({
        where: {
          id: User.verificationid as string,
        },
        data: {
          telegram: true,
        },
      });

      res.status(200).json({
        success: true,
        message: "user password change successfully ",
      });
    });
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

    let User = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!User) {
      return res.status(404).json({
        success: false,
        message: "user not exist , plz signup  ",
      });
    }
    // generate token and send to user email

    // generate token
    let { token, hashedToken } = generateResetToken();
    const expirationDate: Date = dayjs().add(10, "minute").toDate();

    let update = await prisma.user.update({
      where: {
        id: User.id,
      },
      data: {
        forgotpasswordToken: hashedToken,
        resetTokenExpires: expirationDate, // 10 min life  of token
      },
    });

    if (!update) {
      return res.status(401).json({
        success: false,
        message: "token not set , plz try again  ",
      });
    }

    // send token to user email

    let mailer = new Mailer();
    await mailer
      .sendMail(
        email,
        "Reset Password",
        `Your reset password token is ${token}`
      )
      .then(() => {
        res.status(200).json({
          success: true,
          message: "pasword reset token send successfully on your email ",
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(401).json({
          success: false,
          message: "token not send , plz try again  ",
        });
      });
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

    let { email, ForgotpasswordToken, newpassword } = data.data;
    let token_hash = Createhash(ForgotpasswordToken);

    let User = await prisma.user.findUnique({
      where: {
        email: email,
        forgotpasswordToken: token_hash,
      },
    });

    if (!User || User?.resetTokenExpires < new Date()) {
      return res.status(404).json({
        success: false,
        message: "user not exist , plz signup now ",
      });
    }

    await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        password: await hashPasswordFn(newpassword),
        forgotpasswordToken: "-1",
      },
    });

    res.status(200).json({
      success: true,
      message: "user password change successfully ",
    });
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

    let { email, password } = data.data;

    let User = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!User) {
      return res.status(404).json({
        success: false,
        message: "user not exist , plz signup now ",
      });
    }

    // password hash check ;
    let veryfypassword = await veryfyhashPasswordFn(password, User.password);

    if (!veryfypassword) {
      return res.status(401).json({
        success: false,
        message: "credientile incurrect  , plz signup/sign in  ",
      });
    }

    // send token

    setCookie(res, User.id);

    res.status(200).json({
      success: true,
      message: "user login successfully ",
    });
  } catch (error) {
    console.log("Error in user sign in", error);

    res.status(401).json({
      success: false,
      message: "token not send , plz try again  ",
    });
  }
};

// export const getUserprogress = (req: any, res: any) => {
//   try {
//     // let progress = await prisma.progress.f
//   } catch (error) {
//     console.log(error);
//   }
// };

// prossing
