import { ExamType, purchaseType } from  "@repo/packages/prisma"
import prisma from  "@repo/db/index";

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
      throw new Error("user information not found");
    }
    let user_tier = user?.prime?.status;

    let tier = await tx.tier.findFirst({
      where: {
        name: user_tier,
      },
    });

    if (!tier) {
      throw new Error("tier information not found");
    }

    let tierbenifit = await tx.tierBenefit.findFirst({
      where: {
        tierId: tier.id,
        feature: requestSurvice,
      },
    });

    if (!tierbenifit) {
      throw new Error("tierbenifit information not found");
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

export const TokenDeduction = async (
  tx: any,
  userid: string,
  data: string,
  type: "service" | "subscription" = "service"
) => {
  let run = async (tx: any) => {
    let charge: number | null = 0;

    console.log("type is ", type, "data is -->", data);

    switch (type) {
      case "subscription":
        let allsubcription = await tx.subcriptionOffers.findMany({
          where: {
            type: purchaseType.subcription,
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
            allsubcription?.map((subcription:subcription) => {
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
            throw new Error("unknown  charge  subscription request");
        }

        break;

      default:
        // exam ,test , quiz  entry charge  ...
        let examtype = data;
        charge = await getServiceCharge(tx, examtype, userid);

        // if subcription don't have  that survice
        if (charge === null)
          throw new Error("service not avalible  or unknown  charge  request");
    }

    // deduction process

    console.log("charge -- >", charge);

    if (!charge && typeof charge != "number") {
      throw new Error("invalid  balance");
    }

    const userdata = await tx.user.findUnique({
      where: { id: userid },
      select: {
        blance: {
          select: {
            amount: true,
          },
        },
      },
    });

    if (!userdata?.blance) {
      throw new Error("userdata not found");
    }
    // Step 2: Check if the balance is sufficient
    if (userdata?.blance.amount < charge) {
      throw new Error("Insufficient balance");
    }

    let user_blance = await tx.blance.update({
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

    if (user_blance) {
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
