import { asyncHandler } from "@/utils/asyncHandler.js";
import { subscriptionInputZodSchema, subscriptionUpdateZodSchema } from "@/zod/subscription.zod.js";
import { subscriptionService, TierService } from "./service.js";
import { CustomError } from "@/middleware/globalErrorHandler.js";
import { ExamType, primeStatus } from "@repo/db/schema/enums.js";

const tierService = new TierService();

export const createSubscription = asyncHandler(async (req: any, res: any) => {
    const result = subscriptionInputZodSchema.safeParse(req.body);
    if (!result.success) {
        throw new CustomError("Invalid input", 400);
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
        throw new CustomError("Subscription not found", 404);
    }

    return res.json({ success: true, data: subscription });
});

export const updateSubscription = asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    const result = subscriptionUpdateZodSchema.safeParse({ ...req.body, id });
    if (!result.success) {
        throw new CustomError("Invalid input", 400);
    }

    const subscription = await subscriptionService.updateSubscription(id, result.data);
    return res.json({ success: true, message: "Subscription updated", data: subscription });
});

export const deleteSubscription = asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    await subscriptionService.deleteSubscription(id);
    return res.json({ success: true, message: "Subscription deleted" });
});

type BenefitInput = {
  feature: ExamType;
  access: boolean;
  limit: number | null;
  used?: number;
};

export const createOrUpdateTierRequest = asyncHandler(async (req: any, res: any) => {
  // Logic here
});

export const DeleteTierRequest = asyncHandler(async (req: any, res: any) => {
  // Logic here
});

export async function createOrUpdateTier(
  tierName: primeStatus,
  benefits: BenefitInput[]
) {
  return await tierService.createOrUpdateTier(tierName, benefits);
}

export async function removeBenefitFromTier(
  tierName: primeStatus,
  feature: ExamType
) {
  return await tierService.removeBenefitFromTier(tierName, feature);
}

export async function isFeatureAvailable(
  tierName: primeStatus,
  feature: ExamType
): Promise<{
  access: boolean;
  remaining: number | "unlimited";
}> {
  return await tierService.isFeatureAvailable(tierName, feature);
}
