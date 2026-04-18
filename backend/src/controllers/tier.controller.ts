import { ExamType, primeStatus } from "@repo/prisma/client.js";
import { TierService } from "../services/tier.service.js";
import { logger } from "@repo/lib/helper/logger.js";
import { asyncHandler } from "@repo/lib/helper/asyncHandler.js";



const tierService = new TierService();

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
