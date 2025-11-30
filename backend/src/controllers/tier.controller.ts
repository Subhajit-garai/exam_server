import { ExamType, primeStatus } from "@repo/prisma/client.js"
import { TierService } from "../services/tier.service.js";

const tierService = new TierService();

type BenefitInput = {
  feature: ExamType;
  access: boolean;
  limit: number | null;
  used?: number;
};

export async function createOrUpdateTierRequest(req: any, res: any) {
  try {
  } catch (error) {
    console.error("Error in createOrUpdateTierRequest:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
export async function DeleteTierRequest(req: any, res: any) {
  try {
    // let task =  await createOrUpdateTier()
  } catch (error) {
    console.error("Error in DeleteTierRequest:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

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
