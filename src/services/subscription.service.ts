
import { db } from "@repo/db/index.js";
import { subscription_offers } from "@repo/db/schema/offer.js";
import { eq, desc as drizzleDesc } from "drizzle-orm";
import { tiers } from "@repo/db/schema/tier.js";

export class SubscriptionService {
    async createSubscription(data: any) {
        const [offer] = await db.insert(subscription_offers).values({
            ...data,
            type: "SUBSCRIPTION",
        }).returning();
        return offer;
    }

    async getAllSubscriptions() {
        const rows = await db.select({
            offer: subscription_offers,
            tier: tiers
        })
            .from(subscription_offers)
            .leftJoin(tiers, eq(subscription_offers.tier_id, tiers.id))
            .where(eq(subscription_offers.type, "SUBSCRIPTION" as any))
            .orderBy(drizzleDesc(subscription_offers.created_at));

        return rows.map(row => ({
            ...row.offer,
            tier: row.tier
        }));
    }

    async getSubscriptionById(id: string) {
        const [row] = await db.select({
            offer: subscription_offers,
            tier: tiers
        })
            .from(subscription_offers)
            .leftJoin(tiers, eq(subscription_offers.tier_id, tiers.id))
            .where(eq(subscription_offers.id, id))
            .limit(1);

        if (!row) return null;
        return {
            ...row.offer,
            tier: row.tier
        };
    }

    async updateSubscription(id: string, data: any) {
        const [updated] = await db.update(subscription_offers).set({
            ...data,
        }).where(eq(subscription_offers.id, id)).returning();
        return updated;
    }

    async deleteSubscription(id: string) {
        const [deleted] = await db.delete(subscription_offers).where(eq(subscription_offers.id, id)).returning();
        return deleted;
    }
}

export const subscriptionService = new SubscriptionService();

