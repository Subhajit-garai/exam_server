import { db } from "@/db/index.js";
import { RedisManager } from "@/lib/redis/redisManager.js";
import dayjs from "dayjs";
import { logger } from "@/utils/logger.js";
import { activity_leaderboards } from "@/db/schema/activity.js";
import { BaseEvent } from "@subhajit60/event-engine";
import { type eventType } from "@/db/schema/enums.js";

export class ActivityLeaderboardEvent extends BaseEvent<eventType> {
  async push(): Promise<void> {
    logger.info("[ActivityLeaderboardEvent] Starting archival process...");
    const redis = RedisManager.getInstance().getclient();
    const today = dayjs().startOf("day").toDate();

    try {
      // 1. Fetch Global Leaderboard from Redis
      // ZREVRANGE leaderboard:global 0 -1 WITHSCORES
      const result = await redis.zrevrange(
        "leaderboard:global",
        0,
        -1,
        "WITHSCORES",
      );

      if (!result || result.length === 0) {
        logger.info(
          "[ActivityLeaderboardEvent] No leaderboard data to archive.",
        );
        return;
      }

      const historyEntries: any[] = [];
      for (let i = 0; i < result.length; i += 2) {
        const userId = result[i];
        const score = parseInt(result[i + 1]);
        const rank = i / 2 + 1;

        historyEntries.push({
          date: today,
          userId: userId,
          rank: rank,
          score: score,
          type: "daily", // Storing daily snapshot of global leaderboard
        });
      }

      // 2. Bulk Insert into Postgres
      // Using insert for efficiency
      if (historyEntries.length > 0) {
        await db
          .insert(activity_leaderboards)
          .values(historyEntries)
          .onConflictDoNothing();
        logger.success(
          `[ActivityLeaderboardEvent] Archived ${historyEntries.length} leaderboard entries for ${today.toISOString()}`,
        );
      }
    } catch (error: any) {
      logger.error(
        "[ActivityLeaderboardEvent] Error archiving leaderboard:",
        error,
      );
      throw error; // Re-throw to trigger retry logic in BaseEvent
    }
  }
}
