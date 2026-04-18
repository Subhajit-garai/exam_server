import { RedisProvider } from "../lib/redisProvider.js";
import prisma from "@repo/db/index.js";
import { logger } from "../lib/helper/logger.js";


const SYSTEM_STATS_KEY = "system_stats";
const STATS_TTL = 86400 * 2; // 48 hours (to be safe, though refreshed daily)

export class SystemStateService {
    private redis: RedisProvider;

    constructor() {
        this.redis = RedisProvider.getInstance();
    }

    async refreshSystemStats() {
        try {
            logger.info("Calculating system stats...");
            const [
                totalQuestions,
                totalUsers,
                totalExams,
                totalMocks,
                activityCount
            ] = await Promise.all([
                prisma.question.count(),
                prisma.user.count(),
                prisma.exam.count({ where: { examtype: "Test" } }),
                prisma.exam.count({ where: { examtype: "Mock" } }),
                prisma.userActivity.count()
            ]);

            const stats = {
                totalQuestions,
                totalUsers,
                totalExams,
                totalMocks,
                activityCount,
                lastUpdated: new Date()
            };

            // Save to Redis
            const client = this.redis.getclient();
            if (client) {
                await client.set(SYSTEM_STATS_KEY, JSON.stringify(stats), "EX", STATS_TTL);
                logger.success("System stats refreshed and cached in Redis:", stats);
            } else {
                logger.error("Redis client not connected, cannot cache stats");
            }

            return stats;
        } catch (error) {
            logger.error("Error calculating/caching system stats:", error);
            throw error;
        }
    }

    async getSystemStats() {
        try {
            const client = this.redis.getclient();
            if (!client) {
                logger.warn("Redis not connected, calculating fresh stats (fallback)");
                return await this.refreshSystemStats();
            }

            const cached = await client.get(SYSTEM_STATS_KEY);
            if (cached) {
                return JSON.parse(cached);
            }

            logger.info("Stats cache miss, calculating fresh...");
            return await this.refreshSystemStats();
        } catch (error) {
            logger.error("Error getting system stats:", error);
            // Fallback calculation if Redis fails
            return await this.refreshSystemStats();
        }
    }
}
