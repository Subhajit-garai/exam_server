import { z } from "zod";

export const couponInputZodSchema = z.object({
    code: z.string().min(3, "Code must be at least 3 characters").max(20, "Code too long"),
    description: z.string().optional(),
    discountType: z.enum(["PERCENTAGE", "FIXED"]),
    discountValue: z.number().min(0, "Discount value must be positive"),
    maxUses: z.number().int().min(1).optional(),
    perUserLimit: z.number().int().min(1).optional(),
    minOrderAmount: z.number().min(0).optional(),
    expiresAt: z.string().optional(), // Expecting ISO date string
    isActive: z.boolean().default(true).optional(),
});

export const couponUpdateZodSchema = couponInputZodSchema.partial().extend({
    id: z.string().min(1, "ID is required"),
});
