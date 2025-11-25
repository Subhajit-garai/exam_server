import { razerpayinstance } from "../server";
import crypto, { randomUUID } from "crypto";
// import { Payment } from "../models/paymentModel.js";
import prisma from "@repo/db/index";
import dayjs from "dayjs";
import { ExamType, primeStatus, purchaseType } from "@repo/prisma/client";
import {
  subcriptionPurchase_zod_schema,
  tokenPurchase_zod_schema,
} from "../zod/payment.zob";
import {
  isUserHavePrime,
  ProvideSubcriptionTouser,
  TokenDeduction,
} from "@repo/lib/helper/payment";
import { asyncHandler } from "@/lib/helper/asyncHandler";
import { ZodDataSafeParse } from "@/lib/ZodTypeChecker";

async function isPaymentProcessed(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: {
      razorpay_payment_id: paymentId,
    },
  });
  return !!payment; // Return true if payment already processed
}

export const ApplyCupone = async (req: any, res: any) => {
  try {
    res.status(200).json({ success: true, message: "success", data: {} });
  } catch (error) {
    console.log("error in ApplyCupone ", error);
    return res.status(400).json({
      success: false,
      message: "server Error",
    });
  }
};

export const checkoutSubcription = asyncHandler(async (req: any, res: any) => {
  // let userid = req.user;
  let processedData = subcriptionPurchase_zod_schema.safeParse(req.body);

  if (!processedData.success) {
    throw ZodDataSafeParse(processedData);
  }
  let { plan, amount, type } = processedData.data;

  if (type !== "SUBSCRIPTION")
    throw Error("we can not porccesd with wornd plan / payment ");

  let isPlanExist = await prisma.subcriptionOffers.findFirst({
    where: {
      type: type,
      title: plan,
    },
  });

  if (!isPlanExist)
    throw Error("we can not porccesd with wrong plan / payment ");

  await isUserHavePrime(req.user);

  let tierInfo = await prisma.tier.findFirst({
    where: {
      name: plan,
    },
  });
  if (!tierInfo) throw Error(" We are not provided , given / seleced Plan");

  let userid = req.user;
  const options = {
    amount: Number(amount) * 100,
    currency: "INR",
    notes: {
      plan: plan,
      type: type,
    },
  };

  const order = await razerpayinstance.orders.create(options);

  await prisma.order.create({
    data: {
      razorpay_order_id: order.id,
      amount: parseInt(order.amount as string),
      subcription: plan,
      type: type,
      userId: userid,
    },
  });

  res.status(200).json({
    success: true,
    order,
  });
});

export const checkoutToken = asyncHandler(async (req: any, res: any) => {
  let userid = req.user;
  let processedData = tokenPurchase_zod_schema.safeParse(req.body);

  if (!processedData.success) {
    throw ZodDataSafeParse(processedData);
  }
  let { plan, amount, type } = processedData.data;

  if (type !== "TOKEN")
    throw Error("we can not porccesd with wornd plan / payment ");

  let isPlanExist = await prisma.subcriptionOffers.findFirst({
    where: {
      type: type,
      title: plan,
    },
  });

  if (!isPlanExist)
    throw Error("we can not porccesd with wrong plan / payment ");

  let { token } = isPlanExist;

  if (!token) throw Error("Invalid token ! , contact admin");

  const options = {
    amount: Number(amount) * 100,
    currency: "INR",
    notes: {
      token: token.toString(),
      type: purchaseType.TOKEN,
    },
  };
  const order = await razerpayinstance.orders.create(options);

  await prisma.order.create({
    data: {
      razorpay_order_id: order.id,
      amount: parseInt(order.amount as string),
      token: token,
      userId: userid,
    },
  });

  res.status(200).json({
    success: true,
    order,
  });
});

export const paymentVerification = asyncHandler(async (req: any, res: any) => {
  let payment = await prisma.$transaction(async (tx: any) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (await isPaymentProcessed(razorpay_payment_id)) {
      return res
        .status(400)
        .json({ success: false, message: "Duplicate payment detected" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZERPAY_API_SECRET as string)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      const orderDetails = await razerpayinstance.orders.fetch(
        razorpay_order_id
      );

      // check is it token or subcription
      let { amount, status, notes } = orderDetails;

      if (!notes) throw Error("payment issue occere ");

      let { type } = notes;

      switch (type as purchaseType) {
        case "SUBSCRIPTION":
          {
            amount = typeof amount == "string" ? parseInt(amount) : amount;

            let user = await tx.order.update({
              where: {
                order_id: razorpay_order_id,
              },
              data: {
                status: status,
              },
              select: {
                userId: true,
                subcription: true,
              },
            });

            let userid = user?.userId;
            let subcription = user?.subcription;
            // Database update here

            await tx.payment.create({
              data: {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                amount: amount,
                status: status,
                userId: userid,
              },
            });

            await ProvideSubcriptionTouser(userid, subcription, orderDetails);
          }
          break;
        case "TOKEN":
          {
            amount = typeof amount == "string" ? parseInt(amount) : amount;

            let user = await tx.order.update({
              where: {
                order_id: razorpay_order_id,
              },
              data: {
                status: status,
              },
              select: {
                userId: true,
                token: true,
              },
            });

            let userid = user?.userId;
            let token = user?.token;
            // Database update here

            await tx.payment.create({
              data: {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                amount: amount,
                status: status,
                userId: userid,
              },
            });

            await prisma.blance.update({
              where: {
                userid: userid,
              },
              data: {
                amount: {
                  increment: token,
                },
              },
              select: {
                amount: true,
              },
            });
          }
          break;

        default:
          throw Error("Invalid service ");
      }

      const referer = req.get("Referer");
      res.redirect(
        `${referer}#/paymentsuccess?reference=${razorpay_payment_id}`
      );
    } else {
      throw new Error("Payment not valid");
    }
  });
});

export const getSubcriptionAndOffer = asyncHandler(
  async (req: any, res: any) => {
    let data = await prisma.subcriptionOffers.findMany({});

    if (!data) {
      return res.status(400).json({
        success: false,
        message: "offer not found",
      });
    }

    return res.json({
      success: true,
      message: "offer and subcription",
      data: data,
    });
  }
);
