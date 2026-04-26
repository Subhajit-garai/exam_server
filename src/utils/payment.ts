import { ExamType, primeStatus } from "@repo/db/schema/enums.js";
import { db } from "@repo/db/index.js";
import { users, primes, balances } from "@repo/db/schema/user.js";
import { tiers, tier_benefits } from "@repo/db/schema/tier.js";
import { subscription_offers } from "@repo/db/schema/offer.js";
import { eq, and, sql } from "drizzle-orm";
import dayjs from "dayjs";
import { CustomError } from "@/middleware/globalErrorHandler.js";
import { logger } from "@/utils/logger.js";

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
  const run = async (transaction: any) => {
    const userWithPrime = await transaction.query.User.findFirst({
      where: eq(users.id, userid),
      with: {
        prime: {
          columns: {
            status: true,
          },
        },
      },
    });

    if (!userWithPrime) {
      throw new CustomError("User information not found");
    }
    let user_tier = userWithPrime?.prime?.status;

    if (!user_tier) return false;

    const tierData = await transaction.query.Tier.findFirst({
      where: eq(tiers.name, user_tier),
    });

    if (!tierData) {
      throw new CustomError("Tier information not found");
    }

    const tierbenifit = await transaction.query.tier_benefits.findFirst({
      where: and(
        eq(tier_benefits.tier_id, tierData.id),
        eq(tier_benefits.feature, requestSurvice)
      ),
    });

    if (!tierbenifit) {
      return false;
    }

    if (tierbenifit?.access) {
      return true;
    }
    return false;
  };

  if (tx) {
    return await run(tx);
  } else {
    return await db.transaction(run);
  }
};

type subcription = {
  title: string;
  price?: number;
  token?: number;
  time?: string;
};


export const isUserHavePrime = async (userid: string) => {
  let status = await db.query.primes.findFirst({
    where: eq(primes.user_id, userid),
  });

  if (!status?.expiry) return;

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
  await db.transaction(async (tx) => {
    // adding time and prime status
    let getSubcriptionDetails = await tx.query.subscription_offers.findFirst({
      where: and(
        eq(subscription_offers.type, "SUBSCRIPTION"),
        eq(subscription_offers.title, plan)
      ),
      columns: {
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
    await tx.update(primes).set({
      status: plan,
      expiry: dayjs().add(time, "month").toDate(),
    }).where(eq(primes.user_id, userid));
  });
};
export const TokenDeduction = async (
  tx: any,
  userid: string,
  data: string,
  type: "service" | "subscription" = "service"
) => {
  const run = async (transaction: any) => {
    let charge: number | null = 0;

    switch (type) {
      case "subscription":
        const allsubcription = await transaction.query.subcriptionOffers.findMany({
          where: eq(subscription_offers.type, "SUBSCRIPTION"),
          columns: {
            title: true,
            price: true,
            token: true,
            time: true,
          },
        });

        // if user purchasing subcription
        let subcriptionType = data; // Gold, Silver, Bronze
        const matchedSub = allsubcription.find((sub: any) => sub.title === subcriptionType);
        if (matchedSub) {
          charge = matchedSub.price;
        } else {
          throw new Error(`Unknown subscription type: ${subcriptionType}`);
        }
        break;

      default:
        logger.info("default case triggerd (tokendeduction)", data)
    }

    logger.debug("charge:", charge);

    if (charge === null || typeof charge !== "number") {
      throw new Error("Invalid balance calculation");
    }

    const userdata = await transaction.query.User.findFirst({
      where: eq(users.id, userid),
      with: {
        balance: {
          columns: {
            amount: true,
          },
        },
      },
    });

    if (!userdata?.balance) {
      throw new CustomError("User balance not found");
    }

    if (userdata.balance.amount < charge) {
      throw new CustomError("Insufficient balance");
    }

    const [updatedBalance] = await transaction.update(balances).set({
      amount: sql`${balances.amount} - ${charge}`,
    }).where(eq(balances.user_id, userid)).returning({ amount: balances.amount });

    if (updatedBalance) {
      return true;
    }

    return false;
  };

  if (tx) {
    return await run(tx);
  } else {
    return await db.transaction(run);
  }
};


