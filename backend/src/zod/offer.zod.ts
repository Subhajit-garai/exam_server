import { z } from "zod";
import { purchaseType } from "@repo/prisma/enums.js";

export const offerInputZodSchema = z.object({
    title: z.string().min(1, "Title is required"),
    price: z.number().min(0, "Price must be positive"),
    markedPrice: z.number().min(0, "Marked Price must be positive"),
    discount: z.number().min(0).max(100, "Discount must be between 0 and 100"),
    token: z.number().min(1, "Token amount is required for offers"),
    offerActive: z.array(z.string()).default([]),
    offerInActive: z.array(z.string()).default([]),
    btncolor: z.string().optional(),
    type: z.literal(purchaseType.TOKEN).default(purchaseType.TOKEN),
});

export const offerUpdateZodSchema = offerInputZodSchema.partial().extend({
    id: z.string().min(1, "ID is required")
});
