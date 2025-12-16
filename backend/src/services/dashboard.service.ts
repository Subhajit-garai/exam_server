import prisma from "@repo/db/index.js";
import dayjs from "dayjs";

export class DashboardService {

    private getStartDate(range: string): Date {
        const now = dayjs();
        switch (range) {
            case "24h": return now.subtract(24, "hour").toDate();
            case "7d": return now.subtract(7, "day").toDate();
            case "1m": return now.subtract(1, "month").toDate();
            case "3m": return now.subtract(3, "month").toDate();
            case "1y": return now.subtract(1, "year").toDate();
            case "all": return new Date(0); // Beginning of time
            default: return now.subtract(24, "hour").toDate();
        }
    }

    async getPaymentStats(range: string) {
        const startDate = this.getStartDate(range);

        const payments = await prisma.payment.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                },
                status: "captured", // Assuming 'captured' or 'success' means valid revenue
            },
        });

        const totalRevenue = payments.reduce((sum, p) => sum + (p.amount / 100), 0); // Amount is in smallest unit
        const totalTransactions = payments.length;

        return {
            totalRevenue,
            totalTransactions,
            range,
        };
    }

    async getActiveUserCount() {
        // Active users: Online now OR seen in last 15 minutes
        const fifteenMinutesAgo = dayjs().subtract(15, "minute").toDate();

        const onlineCount = await prisma.user.count({
            where: {
                isOnline: true,
            },
        });

        const recentlyActiveCount = await prisma.user.count({
            where: {
                lastSeen: {
                    gte: fifteenMinutesAgo,
                },
            },
        });

        return {
            onlineCount,
            recentlyActiveCount,
        };
    }

    async getKeyMetrics() {
        const totalUsers = await prisma.user.count({
            where: {
                role: "User",
            },
        });

        const totalRevenueResult = await prisma.payment.aggregate({
            _sum: {
                amount: true,
            },
            where: {
                status: "captured",
            },
        });

        const totalOrders = await prisma.order.count();

        return {
            totalUsers,
            totalRevenue: (totalRevenueResult._sum.amount || 0) / 100,
            totalOrders,
        };
    }

    async getPaymentHistory(page: number = 1, limit: number = 10, range: string = "all") {
        const startDate = this.getStartDate(range);
        const skip = (page - 1) * limit;

        const payments = await prisma.payment.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                },
            },
            include: {
                User: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: limit,
            skip: skip,
        });

        const totalDocs = await prisma.payment.count({
            where: {
                createdAt: {
                    gte: startDate,
                },
            },
        });

        return {
            payments,
            pagination: {
                totalDocs,
                totalPages: Math.ceil(totalDocs / limit),
                currentPage: page,
                limit,
            },
        };
    }
}

export const dashboardService = new DashboardService();
