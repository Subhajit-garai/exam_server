import { ExamType, primeStatus, purchaseType } from "@repo/prisma/client.js";
import prisma from "@repo/db/index.js";
import dayjs from "dayjs";
import { CustomError } from "@/middleware/globalErrorHandler.js";
import { logger } from "@repo/lib/helper/logger.js";

// price is merketpricce
export const getFinalPrice = (markedPrice: number, discountPercent: number) => {
  return markedPrice - (markedPrice * discountPercent) / 100;
};

export const getDiscountPercent = (markedPrice: number, price: number) => {
  return ((markedPrice - price) / markedPrice) * 100;
};

export const discountAmount = (
  markedPrice: number,
  discountPercent: number
) => {
  return (markedPrice * discountPercent) / 100;
};

export const getSubcriptionBenifits = async (
  tx: any,
  userid: string,
  requestSurvice: ExamType
) => {
  const run = async (tx: any) => {
    let user = await tx.user.findFirst({
      where: {
        id: userid,
      },
      select: {
        prime: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!user) {
      throw new CustomError("User information not found");
    }
    let user_tier = user?.prime?.status;

    let tier = await tx.tier.findFirst({
      where: {
        name: user_tier,
      },
    });

    if (!tier) {
      throw new CustomError("Tier information not found");
    }

    let tierbenifit = await tx.tierBenefit.findFirst({
      where: {
        tierId: tier.id,
        feature: requestSurvice,
      },
    });

    if (!tierbenifit) {
      throw new CustomError("Tier benefit information not found");
    }

    // console.log("user info =>", user);
    // console.log("tier info =>", tier);
    // console.log("tierbenifit info =>", tierbenifit);

    // console.log("feature  -->", requestSurvice, "acess -->", tierbenifit.access);

    if (tierbenifit?.access) {
      return true;
    }
    return false;
  };

  if (tx) {
    return await run(tx);
  } else {
    return await prisma.$transaction(run);
  }
};

type subcription = {
  title: string;
  price?: number;
  token?: number;
  time?: string;
};


export const isUserHavePrime = async (userid: string) => {
  let status = await prisma.prime.findFirst({
    where: {
      userid: userid,
    },
  });

  let isExist = dayjs().isAfter(dayjs(status?.expiry));

  if (!isExist) {
    throw new CustomError("Already have a subscription");
  }
};

export const ProvideSubcriptionTouser = async (
  userid: string,
  plan: primeStatus,
  razerpay_data: any
) => {
  let trx = await prisma.$transaction(async (tx) => {
    // adding time and prime status
    let getSubcriptionDetails = await tx.subcriptionOffers.findFirst({
      where: {
        type: purchaseType.SUBSCRIPTION,
        title: plan,
      },
      select: {
        price: true,
        time: true,
      },
    });

    logger.debug("Checking subscription details...", getSubcriptionDetails);

    let time: number =
      parseInt(getSubcriptionDetails?.time?.split(" ")[0] as string) ?? 3;
    let timeUnit = getSubcriptionDetails?.time?.split(" ")[1].toLowerCase();

    if (timeUnit !== "month") throw new CustomError("time unit not valid");

    logger.debug("timeUnit:", timeUnit, "time:", time);

    // need dynamic plan and time
    let updatedStatus = await tx.prime.update({
      where: {
        userid: userid,
      },
      data: {
        status: plan as primeStatus,
        expiry: dayjs().add(time, "month").toDate(),
      },
    });
  });
};
export const TokenDeduction = async (
  tx: any,
  userid: string,
  data: string,
  type: "service" | "subscription" = "service"
) => {
  let run = async (tx: any) => {
    let charge: number | null = 0;

    // console.log("type is ", type, "data is -->", data);

    switch (type) {
      case "subscription":
        let allsubcription = await tx.subcriptionOffers.findMany({
          where: {
            type: purchaseType.SUBSCRIPTION,
          },
          select: {
            title: true,
            price: true,
            token: true,
            time: true,
          },
        });

        // if user purchasing subcription
        let subcriptionType = data; // gold , silver , bronch
        switch (subcriptionType) {
          case "Gold":
            allsubcription?.map((subcription: subcription) => {
              if (subcription.title === "Gold") {
                charge = subcription.price ?? 300;
              }
            });
            break;
          case "Silver":
            allsubcription?.map((subcription: subcription) => {
              if (subcription.title === "Silver") {
                charge = subcription.price ?? 200;
              }
            });
            break;
          case "Bronze":
            allsubcription?.map((subcription: subcription) => {
              if (subcription.title === "Bronze") {
                charge = subcription.price ?? 100;
              }
            });
            break;
          default:
            throw new Error("Unknown subscription type");
        }

        break;

      default:
        // exam ,test , quiz  entry charge  ...
        let examtype = data;
        charge = await getServiceCharge(tx, examtype, userid);

        // if subcription don't have  that survice
        if (charge === null)
          throw new Error("Service not available or unknown charge type");
    }

    // deduction process

    logger.debug("charge:", charge);

    if (!charge && typeof charge != "number") {
      throw new Error("Invalid balance");
    }

    const userdata = await tx.user.findUnique({
      where: { id: userid },
      select: {
        balance: {
          select: {
            amount: true,
          },
        },
      },
    });

    if (!userdata?.balance) {
      throw new CustomError("User balance not found");
    }
    // Step 2: Check if the balance is sufficient
    if (userdata?.balance.amount < charge) {
      throw new CustomError("Insufficient balance");
    }

    let user_balance = await tx.balance.update({
      where: {
        userid: userid,
      },
      data: {
        amount: {
          decrement: charge,
        },
      },
      select: {
        amount: true,
      },
    });

    if (user_balance) {
      return true;
    }

    return false;
  };

  if (tx) {
    return await run(tx);
  } else {
    return await prisma.$transaction(run);
  }
};

export const getServiceCharge = async (
  tx: any,
  examtype: string,
  userid: string
) => {
  const run = async (tx: any) => {
    let charge: number | null = 0;

    // if user have subcription
    let isSubcriptionBenifits = await getSubcriptionBenifits(
      tx,
      userid,
      examtype as ExamType
    );

    // console.log("---->", isSubcriptionBenifits);

    if (isSubcriptionBenifits) {
      charge = 0;
    } else {
      const allamount = await tx.entryChargeList.findFirst({
        where: {
          type: examtype,
        },
        select: {
          type: true,
          Charge: true,
        },
      });

      charge = allamount?.Charge ?? null;
    }

    return charge;
  };
  if (tx) {
    return await run(tx);
  } else {
    return await prisma.$transaction(run);
  }
};
