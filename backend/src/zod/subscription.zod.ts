import { z } from "zod";
import { purchaseType, primeStatus } from "@repo/prisma/enums.js";

export const subscriptionInputZodSchema = z.object({
    title: z.string().min(1, "Title is required"),
    price: z.number().min(0, "Price must be positive"),
    markedPrice: z.number().min(0, "Marked Price must be positive"),
    discount: z.number().min(0).max(100, "Discount must be between 0 and 100"),
    time: z.string().min(1, "Duration (time) is required"),
    tierId: z.string().optional(), // Tier ID might be optional if just title matching
    plan: z.nativeEnum(primeStatus).optional(), // Use plan name like BASIC, STANDARD
    offerActive: z.array(z.string()).default([]),
    offerInActive: z.array(z.string()).default([]),
    btncolor: z.string().optional(),
    type: z.literal(purchaseType.SUBSCRIPTION).default(purchaseType.SUBSCRIPTION),
});

export const subscriptionUpdateZodSchema = subscriptionInputZodSchema.partial().extend({
    id: z.string().min(1, "ID is required")
});
