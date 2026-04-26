import {
  subcriptionPurchase_zod_schema,
  tokenPurchase_zod_schema,
  applyCouponZodSchema,
} from "../zod/payment.zod.js"
import { asyncHandler } from "@/utils/asyncHandler.js";
import { ZodDataSafeParse } from "@/utils/ZodTypeChecker.js";
import { PaymentService } from "../services/payment.service.js";
import { couponService } from "@/services/coupon.service.js";
import { logger } from "@/utils/logger.js";
import { CustomError } from "@/middleware/globalErrorHandler.js";

const paymentService = new PaymentService();

export const ApplyCoupon = asyncHandler(async (req: any, res: any) => {
  let processedData = applyCouponZodSchema.safeParse(req.body);

  if (!processedData.success) {
    throw ZodDataSafeParse(processedData);
  }

  const { couponCode, orderAmount } = processedData.data;
  const userId = req.user; // Provided by auth middleware

  const result = await couponService.validateAndApplyCoupon(couponCode, userId, orderAmount);

  return res.status(200).json({ success: true, message: "Coupon applied", data: result });
});

export const checkoutSubcription = asyncHandler(async (req: any, res: any) => {
  let processedData = subcriptionPurchase_zod_schema.safeParse(req.body);

  if (!processedData.success) {
    throw ZodDataSafeParse(processedData);
  }
  let { plan, amount, type, couponCode } = processedData.data;

  const order = await paymentService.checkoutSubcription(req.user, plan, amount, type, couponCode);

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
  let { plan, amount, type, couponCode } = processedData.data;

  const order = await paymentService.checkoutToken(userid, plan, amount, type, couponCode);

  res.status(200).json({
    success: true,
    order,
  });
});

export const paymentVerification = asyncHandler(async (req: any, res: any) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  try {
    await paymentService.paymentVerification(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    const referer = req.get("Referer");
    res.redirect(
      `${referer}#/paymentsuccess?reference=${razorpay_payment_id}`
    );
  } catch (error: any) {
    if (error.message === "Duplicate payment detected") {
      throw new CustomError("Duplicate payment detected", 400);
    }
    throw error;
  }
});

export const getSubcriptionAndOffer = asyncHandler(
  async (req: any, res: any) => {
    let data = await paymentService.getSubcriptionAndOffer();

    if (!data) {
      throw new CustomError("offer not found", 404);
    }

    return res.json({
      success: true,
      message: "offer and subcription",
      data: data,
    });
  }
);

export const getSubcriptionAndOfferFormated = asyncHandler(
  async (req: any, res: any) => {
    logger.debug("getSubcriptionAndOfferFormated called");

    let data = await paymentService.getSubcriptionAndOfferFormated();

    if (!data) {
      throw new CustomError("offer not found", 404);
    }

    logger.debug("getSubcriptionAndOfferFormated data:", data);

    return res.json({
      success: true,
      message: "offer and subcription",
      data: data,
    });
  }
);
