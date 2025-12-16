import { asyncHandler } from "@repo/lib/helper/asyncHandler.js";
import { dashboardService } from "@/services/dashboard.service.js";

export const getDashboardStats = asyncHandler(async (req: any, res: any) => {
    const { range = "24h" } = req.query;

    const [paymentStats, activeUsers, keyMetrics] = await Promise.all([
        dashboardService.getPaymentStats(range as string),
        dashboardService.getActiveUserCount(),
        dashboardService.getKeyMetrics(),
    ]);

    return res.json({
        success: true,
        data: {
            paymentStats,
            activeUsers,
            keyMetrics,
        },
    });
});

export const getPayments = asyncHandler(async (req: any, res: any) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const range = (req.query.range as string) || "all";

    const data = await dashboardService.getPaymentHistory(page, limit, range);

    return res.json({
        success: true,
        data,
    });
});
