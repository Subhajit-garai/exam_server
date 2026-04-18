import { BaseEvent } from "../bace-event.js";
import prisma from "@repo/db/index.js";
import { RedisProvider } from "@/lib/redisProvider.js";
import dayjs from "dayjs";
import { logger } from "@/lib/helper/logger.js";

export class ActivityLeaderboardEvent extends BaseEvent {
    async push(): Promise<void> {
        // This method is called by BaseEvent.run()
        // It contains the core logic for the event

        logger.info("[ActivityLeaderboardEvent] Starting archival process...");
        const redis = RedisProvider.getInstance().getclient();
        const today = dayjs().startOf("day").toDate();

        try {
            // 1. Fetch Global Leaderboard from Redis
            // ZREVRANGE leaderboard:global 0 -1 WITHSCORES
            const result = await redis.zrevrange("leaderboard:global", 0, -1, "WITHSCORES");

            if (!result || result.length === 0) {
                logger.info("[ActivityLeaderboardEvent] No leaderboard data to archive.");
                return;
            }

            const historyEntries = [];
            for (let i = 0; i < result.length; i += 2) {
                const userId = result[i];
                const score = parseInt(result[i + 1]);
                const rank = (i / 2) + 1;

                historyEntries.push({
                    date: today,
                    userId: userId,
                    rank: rank,
                    score: score,
                    type: "daily", // Storing daily snapshot of global leaderboard
                });
            }

            // 2. Bulk Insert into Postgres
            // Using createMany for efficiency
            if (historyEntries.length > 0) {
                await prisma.activityLeaderboard.createMany({
                    data: historyEntries,
                    skipDuplicates: true, // Avoid crashing on duplicate runs
                });
                logger.success(`[ActivityLeaderboardEvent] Archived ${historyEntries.length} leaderboard entries for ${today.toISOString()}`);
            }

        } catch (error) {
            logger.error("[ActivityLeaderboardEvent] Error archiving leaderboard:", error);
            throw error; // Re-throw to trigger retry logic in BaseEvent
        }
    }
}
