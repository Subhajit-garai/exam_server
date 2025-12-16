import prisma from "@repo/db/index.js";
import { purchaseType } from "@repo/prisma/enums";

export class SubscriptionService {
    async createSubscription(data: any) {
        return await prisma.subcriptionOffers.create({
            data: {
                ...data,
                type: purchaseType.SUBSCRIPTION,
            },
        });
    }

    async getAllSubscriptions() {
        return await prisma.subcriptionOffers.findMany({
            where: {
                type: purchaseType.SUBSCRIPTION,
            },
            include: {
                tier: true,
            },
            orderBy: {
                created_at: "desc",
            },
        });
    }

    async getSubscriptionById(id: string) {
        return await prisma.subcriptionOffers.findUnique({
            where: {
                id,
            },
            include: {
                tier: true,
            },
        });
    }

    async updateSubscription(id: string, data: any) {
        return await prisma.subcriptionOffers.update({
            where: {
                id,
            },
            data,
        });
    }

    async deleteSubscription(id: string) {
        return await prisma.subcriptionOffers.delete({
            where: {
                id,
            },
        });
    }
}

export const subscriptionService = new SubscriptionService();
