import prisma from "@repo/db/index.js";
import { purchaseType } from "@repo/prisma/enums.js";

export class OfferService {
    async createOffer(data: any) {
        return await prisma.subcriptionOffers.create({
            data: {
                ...data,
                type: purchaseType.TOKEN,
            },
        });
    }

    async getAllOffers() {
        return await prisma.subcriptionOffers.findMany({
            where: {
                type: purchaseType.TOKEN,
            },
            orderBy: {
                created_at: "desc",
            },
        });
    }

    async getOfferById(id: string) {
        return await prisma.subcriptionOffers.findUnique({
            where: {
                id,
            },
        });
    }

    async updateOffer(id: string, data: any) {
        return await prisma.subcriptionOffers.update({
            where: {
                id,
            },
            data,
        });
    }

    async deleteOffer(id: string) {
        return await prisma.subcriptionOffers.delete({
            where: {
                id,
            },
        });
    }
}

export const offerService = new OfferService();
