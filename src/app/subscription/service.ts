import { db } from "@/db/index.js";
import { subscription_offers, tiers, tier_benefits } from "@/db/schema.js";
import { eq, desc as drizzleDesc, and } from "drizzle-orm";
import { ExamType, primeStatus } from "@/db/enums.js";

type BenefitInput = {
  feature: ExamType;
  access: boolean;
  limit: number | null;
  used?: number;
};

export class SubscriptionService {
  async createSubscription(data: any) {
    const [offer] = await db
      .insert(subscription_offers)
      .values({
        ...data,
        type: "SUBSCRIPTION",
      })
      .returning();
    return offer;
  }

  async getAllSubscriptions() {
    const rows = await db
      .select({
        offer: subscription_offers,
        tier: tiers,
      })
      .from(subscription_offers)
      .leftJoin(tiers, eq(subscription_offers.tier_id, tiers.id))
      .where(eq(subscription_offers.type, "SUBSCRIPTION" as any))
      .orderBy(drizzleDesc(subscription_offers.created_at));

    return rows.map((row) => ({
      ...row.offer,
      tier: row.tier,
    }));
  }

  async getSubscriptionById(id: string) {
    const [row] = await db
      .select({
        offer: subscription_offers,
        tier: tiers,
      })
      .from(subscription_offers)
      .leftJoin(tiers, eq(subscription_offers.tier_id, tiers.id))
      .where(eq(subscription_offers.id, id))
      .limit(1);

    if (!row) return null;
    return {
      ...row.offer,
      tier: row.tier,
    };
  }

  async updateSubscription(id: string, data: any) {
    const [updated] = await db
      .update(subscription_offers)
      .set({
        ...data,
      })
      .where(eq(subscription_offers.id, id))
      .returning();
    return updated;
  }

  async deleteSubscription(id: string) {
    const [deleted] = await db
      .delete(subscription_offers)
      .where(eq(subscription_offers.id, id))
      .returning();
    return deleted;
  }
}

export class TierService {
  async createOrUpdateTier(tierName: primeStatus, benefits: BenefitInput[]) {
    const [existing] = await db
      .select()
      .from(tiers)
      .where(eq(tiers.name, tierName))
      .limit(1);

    if (!existing) {
      return await db.transaction(async (tx) => {
        const [newTier] = await tx
          .insert(tiers)
          .values({
            name: tierName,
            updated_at: new Date(),
          })
          .returning();

        if (benefits.length > 0) {
          await tx.insert(tier_benefits).values(
            benefits.map((b) => ({
              tier_id: newTier.id,
              feature: b.feature,
              access: b.access,
              limit: b.limit,
              used: b.used ?? 0,
              updated_at: new Date(),
            })),
          );
        }

        const [tier] = await tx
          .select()
          .from(tiers)
          .where(eq(tiers.id, newTier.id))
          .limit(1);
        if (tier) {
          const benefitsData = await tx
            .select()
            .from(tier_benefits)
            .where(eq(tier_benefits.tier_id, tier.id));
          return { ...tier, benefits: benefitsData };
        }
        return null;
      });
    } else {
      return await db.transaction(async (tx) => {
        const updates = await Promise.all(
          benefits.map(async (b) => {
            const [existingBenefit] = await tx
              .select()
              .from(tier_benefits)
              .where(
                and(
                  eq(tier_benefits.tier_id, existing.id),
                  eq(tier_benefits.feature, b.feature),
                ),
              )
              .limit(1);

            if (existingBenefit) {
              const [updated] = await tx
                .update(tier_benefits)
                .set({
                  access: b.access,
                  limit: b.limit,
                  used: b.used ?? 0,
                  updated_at: new Date(),
                })
                .where(eq(tier_benefits.id, existingBenefit.id))
                .returning();
              return updated;
            } else {
              const [created] = await tx
                .insert(tier_benefits)
                .values({
                  tier_id: existing.id,
                  feature: b.feature,
                  access: b.access,
                  limit: b.limit,
                  used: b.used ?? 0,
                  updated_at: new Date(),
                })
                .returning();
              return created;
            }
          }),
        );
        return updates;
      });
    }
  }

  async removeBenefitFromTier(tierName: primeStatus, feature: ExamType) {
    const [tier] = await db
      .select()
      .from(tiers)
      .where(eq(tiers.name, tierName))
      .limit(1);
    if (!tier) throw new Error("Tier not found");

    return await db
      .delete(tier_benefits)
      .where(
        and(
          eq(tier_benefits.tier_id, tier.id),
          eq(tier_benefits.feature, feature),
        ),
      )
      .returning();
  }

  async isFeatureAvailable(
    tierName: primeStatus,
    feature: ExamType,
  ): Promise<{
    access: boolean;
    remaining: number | "unlimited";
  }> {
    const [tierData] = await db
      .select()
      .from(tiers)
      .where(eq(tiers.name, tierName))
      .limit(1);
    if (!tierData) return { access: false, remaining: 0 };

    const benefits = await db
      .select({
        access: tier_benefits.access,
        limit: tier_benefits.limit,
        used: tier_benefits.used,
      })
      .from(tier_benefits)
      .where(
        and(
          eq(tier_benefits.tier_id, tierData.id),
          eq(tier_benefits.feature, feature),
        ),
      );

    const tier = { ...tierData, benefits };

    if (!tier || (tier.benefits as any[]).length === 0) {
      return { access: false, remaining: 0 };
    }

    const benefit = (tier.benefits as any[])[0];

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
}

export const subscriptionService = new SubscriptionService();
