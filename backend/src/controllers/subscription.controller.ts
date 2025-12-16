import { asyncHandler } from "@repo/lib/helper/asyncHandler.js";
import { subscriptionInputZodSchema, subscriptionUpdateZodSchema } from "@/zod/subscription.zod.js";
import { subscriptionService } from "@/services/subscription.service.js";

export const createSubscription = asyncHandler(async (req: any, res: any) => {
    const result = subscriptionInputZodSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ success: false, message: "Invalid input", errors: result.error.errors });
    }

    const subscription = await subscriptionService.createSubscription(result.data);
    return res.status(201).json({ success: true, message: "Subscription created", data: subscription });
});

export const getAllSubscriptions = asyncHandler(async (req: any, res: any) => {
    const subscriptions = await subscriptionService.getAllSubscriptions();
    return res.json({ success: true, data: subscriptions });
});

export const getSubscriptionById = asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    const subscription = await subscriptionService.getSubscriptionById(id);
    if (!subscription) {
        return res.status(404).json({ success: false, message: "Subscription not found" });
    }
    return res.json({ success: true, data: subscription });
});

export const updateSubscription = asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    const result = subscriptionUpdateZodSchema.safeParse({ ...req.body, id });
    if (!result.success) {
        return res.status(400).json({ success: false, message: "Invalid input", errors: result.error.errors });
    }

    const subscription = await subscriptionService.updateSubscription(id, result.data);
    return res.json({ success: true, message: "Subscription updated", data: subscription });
});

export const deleteSubscription = asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    await subscriptionService.deleteSubscription(id);
    return res.json({ success: true, message: "Subscription deleted" });
});
