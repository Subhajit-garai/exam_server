import {
  subcriptionPurchase_zod_schema,
  tokenPurchase_zod_schema,
} from "../zod/payment.zod.js"
import { asyncHandler } from "@/lib/helper/asyncHandler.js";
import { ZodDataSafeParse } from "@/lib/ZodTypeChecker.js";
import { PaymentService } from "../services/payment.service.js";

const paymentService = new PaymentService();

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

  const order = await paymentService.checkoutSubcription(req.user, plan, amount, type);

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

  const order = await paymentService.checkoutToken(userid, plan, amount, type);

  res.status(200).json({
    success: true,
    order,
  });
});

export const paymentVerification = asyncHandler(async (req: any, res: any) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    await paymentService.paymentVerification(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    const referer = req.get("Referer");
    res.redirect(
      `${referer}#/paymentsuccess?reference=${razorpay_payment_id}`
    );
  } catch (error: any) {
    if (error.message === "Duplicate payment detected") {
      return res
        .status(400)
        .json({ success: false, message: "Duplicate payment detected" });
    }
    throw error;
  }
});

export const getSubcriptionAndOffer = asyncHandler(
  async (req: any, res: any) => {
    let data = await paymentService.getSubcriptionAndOffer();

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
