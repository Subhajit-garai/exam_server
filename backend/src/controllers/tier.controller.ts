import { ExamType, primeStatus } from "@prisma/client";
import prisma from "../../db";
import { debuglog } from "../../lib/helper/debugLog";

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
  // Check if tier exists
  const existing = await prisma.tier.findUnique({
    where: { name: tierName },
  });

  if (!existing) {
    // Create Tier
    const newTier = await prisma.tier.create({
      data: {
        name: tierName,
        benefits: {
          create: benefits.map((b) => ({
            feature: b.feature,
            access: b.access,
            limit: b.limit,
            used: b.used ?? 0,
          })),
        },
      },
      include: { benefits: true },
    });
    console.log(`Created tier ${tierName}`, newTier);
    return newTier;
  } else {
    // Update/Add/Upsert each benefit
    const updates = await Promise.all(
      benefits.map((b) =>
        prisma.tierBenefit.upsert({
          where: {
            tierId_feature: {
              tierId: existing.id,
              feature: b.feature,
            },
          },
          update: {
            access: b.access,
            limit: b.limit,
            used: b.used ?? 0,
          },
          create: {
            tierId: existing.id,
            feature: b.feature,
            access: b.access,
            limit: b.limit,
            used: b.used ?? 0,
          },
        })
      )
    );
    return updates;
  }
}

export async function removeBenefitFromTier(
  tierName: primeStatus,
  feature: ExamType
) {
  const tier = await prisma.tier.findUnique({
    where: { name: tierName },
  });
  if (!tier) throw new Error("Tier not found");

  return await prisma.tierBenefit.deleteMany({
    where: {
      tierId: tier.id,
      feature,
    },
  });

  console.log(`Removed ${feature} from tier ${tierName}`);
}

export async function isFeatureAvailable(
  tierName: primeStatus,
  feature: ExamType
): Promise<{
  access: boolean;
  remaining: number | "unlimited";
}> {
  const tier = await prisma.tier.findUnique({
    where: { name: tierName },
    select:{
      benefits:{
        where: { feature: feature },
        select: {
          access: true,
          limit: true,
          used: true,
        },
      }
    }
   
  });

  if (!tier || tier.benefits.length === 0) {
    return { access: false, remaining: 0 };
  }

  const benefit = tier.benefits[0];

  if (!benefit.access) {
    return { access: false, remaining: 0 };
  }

  const remaining =
    benefit.limit === null
      ? "unlimited"
      : Math.max((benefit.limit ?? 0) - (benefit.used ?? 0), 0);

  return {
    access: true,
    remaining,
  };
}
