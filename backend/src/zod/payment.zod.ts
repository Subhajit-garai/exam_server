import { OfferPlan, primeStatus, purchaseType } from "@repo/prisma/enums.js";
import z from "zod";

export const subcriptionPurchase_zod_schema = z.object({
  plan: z.nativeEnum(primeStatus),
  amount: z.string(),
  type: z.nativeEnum(purchaseType),
  couponCode: z.string().optional(),
});

export const tokenPurchase_zod_schema = z.object({
  plan: z.nativeEnum(OfferPlan),
  amount: z.string(),
  type: z.nativeEnum(purchaseType),
  couponCode: z.string().optional(),
});

export const applyCouponZodSchema = z.object({
  couponCode: z.string().min(1, "Coupon code is required"),
  orderAmount: z.number().min(0, "Order amount must be positive"), // In smallest unit (e.g., paise)
});
