import { RedisManager } from "@/lib/redis/redisManager.js";
import { db } from "@repo/db/index.js";
import { questions } from "@repo/db/schema/question.js";
import { users } from "@repo/db/schema/user.js";
import { exams } from "@repo/db/schema/exam.js";
import { user_activities } from "@repo/db/schema/activity.js";
import { count, eq } from "drizzle-orm";
import { logger } from "@/utils/logger.js";

const SYSTEM_STATS_KEY = "system_stats";
const STATS_TTL = 86400 * 2; // 48 hours (to be safe, though refreshed daily)

export class SystemStateService {
  private redis: RedisManager;

  constructor() {
    this.redis = RedisManager.getInstance();
  }

  async refreshSystemStats() {
    try {
      logger.info("Calculating system stats...");

      const [
        [{ value: totalQuestions }],
        [{ value: totalUsers }],
        [{ value: totalExams }],
        [{ value: totalMocks }],
        [{ value: activityCount }],
      ] = await Promise.all([
        db.select({ value: count() }).from(questions),
        db.select({ value: count() }).from(users),
        db
          .select({ value: count() })
          .from(exams)
          .where(eq(exams.exam_type, "Test")),
        db
          .select({ value: count() })
          .from(exams)
          .where(eq(exams.exam_type, "Mock")),
        db.select({ value: count() }).from(user_activities),
      ]);

      const stats = {
        totalQuestions,
        totalUsers,
        totalExams,
        totalMocks,
        activityCount,
        lastUpdated: new Date(),
      };

      const client = this.redis.getclient();
      if (client) {
        await client.set(
          SYSTEM_STATS_KEY,
          JSON.stringify(stats),
          "EX",
          STATS_TTL,
        );
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
      return await this.refreshSystemStats();
    }
  }
}
