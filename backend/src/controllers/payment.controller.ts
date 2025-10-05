import { razerpayinstance } from "../server";
import crypto, { randomUUID } from "crypto";
// import { Payment } from "../models/paymentModel.js";
import prisma from "../../db";
import dayjs from "dayjs";
import { ExamType, primeStatus, purchaseType } from "@prisma/client";
import { subcriptionPurchase_zod_schema } from "../zod/payment.zob";
import { TokenDeduction } from "../../lib/helper/payment";

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

export const checkoutSubcription = async (req: any, res: any) => {
  try {
    let userid = req.user;

    let data = subcriptionPurchase_zod_schema.safeParse(req.body);

    if (!data.success) {
      return res.status(401).json({
        success: false,
        message: "inpute format/value invalid ",
      });
    }

    let { plan, amount } = data.data;
    let orderid = randomUUID();
    // check status is already any tier or not expired

    let trx = await prisma.$transaction(async (tx) => {
      let status = await tx.prime.findFirst({
        where: {
          userid: req.user,
        },
      });

      let isExceed = dayjs().isAfter(dayjs(status?.expiry));

      if (!isExceed) {
        throw new Error("Already have a subscription");
      }

      // reduce token from user balance
      let transaction = await TokenDeduction(tx,userid, plan, "subscription");

      if (transaction) {
        // add tier , user

        let getSubcriptionDetails = await tx.subcriptionOffers.findFirst({
          where: {
            type: purchaseType.subcription,
            title: plan,
          },
          select: {
            price: true,
            time: true,
          },
        });

        console.log(
          " checking getSubcriptionDetails .....",
          getSubcriptionDetails
        );

        let time: number =
          parseInt(getSubcriptionDetails?.time?.split(" ")[0] as string) ?? 3;
        let timeUnit = getSubcriptionDetails?.time?.split(" ")[1].toLowerCase();

        if (timeUnit !== "month") throw new Error("time unit not valid");

        console.log("timeUnit", timeUnit, time);

        // need dynamic plan and time
        let updatedStatus = await tx.prime.update({
          where: {
            userid: req.user,
          },
          data: {
            status: plan as primeStatus,
            expiry: dayjs().add(time, "month").toDate(),
          },
        });

        if (updatedStatus) {
          console.log("updatedStatus", updatedStatus);

          await tx.order.create({
            data: {
              order_id: orderid,
              amount: parseInt(amount),
              subcription: plan,
              userId: userid,
            },
          });
        }

        // add expiry
      }
    });

    res.status(200).json({
      success: true,
      plan,
      message: "purchase successful",
    });
  } catch (error: any) {
    console.log("error in checkoutSubcription ", error);

    return res.status(400).json({
      success: false,
      message: error?.message,
    });
  }
};

export const checkout = async (req: any, res: any) => {
  try {
    let userid = req.user;
    let token = req.body.token;
    const options = {
      amount: Number(req.body.amount * 100),
      currency: "INR",
    };
    const order = await razerpayinstance.orders.create(options);

    await prisma.order.create({
      data: {
        order_id: order.id,
        amount: parseInt(order.amount as string),
        token: parseInt(token as string),
        userId: userid,
      },
    });

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log("error in checkout ", error);

    return res.status(400).json({
      success: false,
      message: "server Error",
    });
  }
};

export const paymentVerification = async (req: any, res: any) => {
  try {
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
        let { amount, status } = orderDetails;

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

        const referer = req.get("Referer");

        res.redirect(
          `${referer}#/paymentsuccess?reference=${razorpay_payment_id}`
        );
      } else {
        throw new Error("Payment not valid");
      }
    });
  } catch (error: any) {
    console.log("error in paymentVerification ", error);
    return res.status(400).json({
      success: false,
      message: error?.message,
    });
  }
};

export const getSubcriptionAndOffer = async (req: any, res: any) => {
  try {
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
  } catch (error) {
    console.log("error in getSubcriptionAndOffer ", error);

    return res.status(400).json({
      success: false,
      message: "server Error",
    });
  }
};



