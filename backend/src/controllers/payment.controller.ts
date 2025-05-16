import { razerpayinstance } from "../surver";
import crypto, { randomUUID } from "crypto";
// import { Payment } from "../models/paymentModel.js";
import prisma from "../../db";
import dayjs from "dayjs";

async function isPaymentProcessed(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: {
      razorpay_payment_id: paymentId,
    },
  });
  return !!payment; // Return true if payment already processed
}

export const TokenDeduction = async (
  userid: string,
  data: string,
  type: "service" | "subscription" = "service"
) => {
  let status = await prisma.$transaction(async (tx: any) => {
    let charge = 0;

    switch (type) {
      case "subscription":
        let allsubcription = await prisma.subcriptionChargelist.findFirst({
          select: {
            gold: true,
            silver: true,
            bronze: true,
          },
        });
        // if user purchasing subcription
        let subcriptionType = data; // gold , silver , bronch
        switch (subcriptionType) {
          case "gold":
            charge = allsubcription?.gold ?? 300;
            break;
          case "silver":
            charge = allsubcription?.gold ?? 280;
            break;
          case "bronze":
            charge = allsubcription?.gold ?? 120;
            break;
          default:
            charge = 300;
        }

        break;

      default:
        // exam ,test , quiz ...
        let examtype = data;

        // here get entry charge for exam , mock and contest subject
        const allamount = await tx.entryChargeList.findFirst({
          select: {
            exam: true,
            mock: true,
            contest: true,
            subject: true,
            quiz: true,
          },
        });

        switch (examtype) {
          case "Exam":
            charge = allamount?.exam ?? 2;
            break;
          case "Mock":
            charge = allamount?.mock ?? 2;
            break;
          case "Contest":
            charge = allamount?.contest ?? 2;
            break;
          case "Subject":
            charge = allamount?.subject ?? 2;
            break;
          default:
            charge = 2;
        }

        break;
    }

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
  });

  return status;
};

export const checkoutSubcription = async (req: any, res: any) => {
  try {
    let userid = req.user;
    let { plan, amount, time } = req.body;

    let orderid = randomUUID();
    console.log("----->", orderid);

    // check status is already any tier or not expired

    let trx = await prisma.$transaction( async(tx) => {
      let status = await tx.prime.findFirst({
        where: {
          userid: req.user,
        },
      });

      let isExceed = dayjs().isAfter(dayjs(status?.expiry));

      if (!isExceed) {
        return res.json({
          success: true,
          message: "Your tier is not expired",
        });
      }

      let transaction = await TokenDeduction(userid, plan, "subscription");

      if (transaction) {
        await tx.order.create({
          data: {
            order_id: orderid,
            amount: parseInt(amount as string),
            subcription: plan,
            userId: userid,
          },
        });

        // add tier

        let updatedStatus = await tx.prime.update({
          where: {
            userid: req.user,
          },
          data: {
            status: plan,
            expiry:dayjs().add(3,"month").toDate()
          },
        });

        // add expiry
      }
    });

    res.status(200).json({
      success: true,
      plan,
      message: "purchase successful",
    });
  } catch (error) {
    console.log("error in checkoutSubcription ", error);

    res.status(400).json({
      success: false,
      message: "server Error",
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

    res.status(400).json({
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
            razorpay_order_id: razorpay_order_id,
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
        res.status(400).json({
          success: false,
          message: "User Payment not Valid",
        });
      }
    });
  } catch (error) {
    console.log("error in paymentVerification ", error);

    res.status(400).json({
      success: false,
      message: "server Error",
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

    res.json({
      success: true,
      message: "offer and subcription",
      data: data,
    });
  } catch (error) {
    console.log("error in getSubcriptionAndOffer ", error);

    res.status(400).json({
      success: false,
      message: "server Error",
    });
  }
};
