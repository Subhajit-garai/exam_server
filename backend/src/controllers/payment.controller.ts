import { razerpayinstance } from "../surver";
import crypto from "crypto";
// import { Payment } from "../models/paymentModel.js";
import prisma from "../../db";

async function isPaymentProcessed(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: {
      razorpay_payment_id: paymentId,
    },
  });
  return !!payment; // Return true if payment already processed
}

export const checkout = async (req: any, res: any) => {
  let userid = req.user;
  const options = {
    amount: Number(req.body.amount * 100),
    currency: "INR",
  };
  const order = await razerpayinstance.orders.create(options);

  await prisma.order.create({
    data: {
      razorpay_order_id: order.id,
      amount: parseInt(order.amount as string),
      userId: userid,
    },
  });

  res.status(200).json({
    success: true,
    order,
  });
};

export const paymentVerification = async (req: any, res: any) => {
  
  let payment = await prisma.$transaction(async (tx:any) => {
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
      let { amount , status } = orderDetails;

      amount = typeof(amount) == "string" ? parseInt(amount):amount

      let user = await tx.order.update({
        where: {
          razorpay_order_id: razorpay_order_id,
        },
        data: {
          status: status,
        },
        select: {
          userId: true,
        },
      });


      let userid = user.userId;

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
        where:{
          userid:userid
        },
        data:{
          amount:{
            increment:(amount/100)
          }
        },
        select: {
          amount: true
        },

      });


      const referer = req.get('Referer');
      
      res.redirect(
        `${referer}#/paymentsuccess?reference=${razorpay_payment_id}`
      );
    } else {
      res.status(400).json({
        success: false,
        message: "User Payment not Valid"
      });
    }
  });
};
