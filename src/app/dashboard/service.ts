import dayjs from "dayjs";
import { db } from "@/db/index.js";
import { payments, orders, users } from "@/db/schema.js";
import {
  eq,
  gte,
  and,
  sum,
  count as drizzleCount,
  desc as drizzleDesc,
} from "drizzle-orm";

export class DashboardService {
  private getStartDate(range: string): Date {
    const now = dayjs();
    switch (range) {
      case "24h":
        return now.subtract(24, "hour").toDate();
      case "7d":
        return now.subtract(7, "day").toDate();
      case "1m":
        return now.subtract(1, "month").toDate();
      case "3m":
        return now.subtract(3, "month").toDate();
      case "1y":
        return now.subtract(1, "year").toDate();
      case "all":
        return new Date(0); // Beginning of time
      default:
        return now.subtract(24, "hour").toDate();
    }
  }

  async getPaymentStats(range: string) {
    const startDate = this.getStartDate(range);

    const paymentsData = await db
      .select()
      .from(payments)
      .where(
        and(
          gte(payments.created_at, startDate),
          eq(payments.status, "captured"),
        ),
      );

    const totalRevenue = paymentsData.reduce(
      (sum: number, p: any) => sum + p.amount / 100,
      0,
    );
    const totalTransactions = paymentsData.length;

    return {
      totalRevenue,
      totalTransactions,
      range,
    };
  }

  async getActiveUserCount() {
    const fifteenMinutesAgo = dayjs().subtract(15, "minute").toDate();

    const onlineCountResult = await db
      .select({ value: drizzleCount() })
      .from(users)
      .where(eq(users.is_online, true));
    const onlineCount = onlineCountResult[0].value;

    const recentlyActiveCountResult = await db
      .select({ value: drizzleCount() })
      .from(users)
      .where(gte(users.last_seen, fifteenMinutesAgo));
    const recentlyActiveCount = recentlyActiveCountResult[0].value;

    return {
      onlineCount,
      recentlyActiveCount,
    };
  }

  async getKeyMetrics() {
    const totalUsersResult = await db
      .select({ value: drizzleCount() })
      .from(users)
      .where(eq(users.role, "User"));
    const totalUsers = totalUsersResult[0].value;

    const totalRevenueResult = await db
      .select({ value: sum(payments.amount) })
      .from(payments)
      .where(eq(payments.status, "captured"));
    const totalRevenue = parseInt(totalRevenueResult[0].value || "0") / 100;

    const totalOrdersResult = await db
      .select({ value: drizzleCount() })
      .from(orders);
    const totalOrders = totalOrdersResult[0].value;

    return {
      totalUsers,
      totalRevenue,
      totalOrders,
    };
  }

  async getPaymentHistory(
    page: number = 1,
    limit: number = 10,
    range: string = "all",
  ) {
    const startDate = this.getStartDate(range);
    const skipAmount = (page - 1) * limit;

    const paymentsList = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        status: payments.status,
        createdAt: payments.created_at,
        userId: payments.user_id,
        razorpay_payment_id: payments.razorpay_payment_id,
        razorpay_order_id: payments.razorpay_order_id,
        razorpay_signature: payments.razorpay_signature,
        currency: payments.currency,
        User: {
          name: users.name,
          email: users.email,
        },
      })
      .from(payments)
      .leftJoin(users, eq(payments.user_id, users.id))
      .where(gte(payments.created_at, startDate))
      .orderBy(drizzleDesc(payments.created_at))
      .limit(limit)
      .offset(skipAmount);

    const totalDocsResult = await db
      .select({ value: drizzleCount() })
      .from(payments)
      .where(gte(payments.created_at, startDate));
    const totalDocs = totalDocsResult[0].value;

    return {
      payments: paymentsList,
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
