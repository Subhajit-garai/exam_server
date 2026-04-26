import { OfferPlan, primeStatus, purchaseType } from "@repo/db/schema/enums.js";
import z from "zod";

export const subcriptionPurchase_zod_schema = z.object({
  plan: z.enum(primeStatus.enumValues),
  amount: z.string(),
  type: z.enum(purchaseType.enumValues),
  couponCode: z.string().optional(),
});

export const tokenPurchase_zod_schema = z.object({
  type: z.enum(purchaseType.enumValues),
  plan: z.enum(primeStatus.enumValues),
  amount: z.string(),
  couponCode: z.string().optional(),
});

export const applyCouponZodSchema = z.object({
  couponCode: z.string().min(1, "Coupon code is required"),
  orderAmount: z.number().min(0, "Order amount must be positive"), // In smallest unit (e.g., paise)
});
