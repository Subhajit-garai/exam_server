import prisma from "../../../db/index";


export const settings = async() =>{
    const bot_access = await prisma.appConfig.create({
    data: {
      feature: "bot-access",
      settings: { status: "open" },
    },
  });
  const raser_pay_access_setting = await prisma.appConfig.create({
    data: {
      feature: "razerpay-testaccess",
      settings: { status: "close" },
    },
  });
  const payment_access = await prisma.appConfig.create({
    data: {
      feature: "token-purchases",
      settings: { status: "close" },
    },
  });
  const user_login_access = await prisma.appConfig.create({
    data: {
      feature: "user-login",
      settings: { status: "open" },
    },
  });
  const user_signup_access = await prisma.appConfig.create({
    data: {
      feature: "user-signup",
      settings: { status: "close" },
    },
  });

}