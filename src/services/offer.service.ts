import { purchaseType } from "@repo/db/schema/enums.js";
import { db } from "@repo/db/index.js";
import { subscription_offers } from "@repo/db/schema/offer.js";
import { eq, desc } from "drizzle-orm";

export class OfferService {
    async createOffer(data: any) {
        const [offer] = await db.insert(subscription_offers).values({
            ...data,
            type: "TOKEN",
        }).returning();
        return offer;
    }

    async getAllOffers() {
        return await db.select().from(subscription_offers).where(
            eq(subscription_offers.type, "TOKEN")
        ).orderBy(desc(subscription_offers.created_at));
    }

    async getOfferById(id: string) {
        const [offer] = await db.select().from(subscription_offers).where(eq(subscription_offers.id, id));
        return offer || null;
    }

    async updateOffer(id: string, data: any) {
        const [offer] = await db.update(subscription_offers)
            .set(data)
            .where(eq(subscription_offers.id, id))
            .returning();
        return offer;
    }

    async deleteOffer(id: string) {
        const [offer] = await db.delete(subscription_offers)
            .where(eq(subscription_offers.id, id))
            .returning();
        return offer;
    }
}

export const offerService = new OfferService();

