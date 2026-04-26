import { logger } from "@/utils/logger.js";
import { CronJob } from "cron";
import { RedisManager } from "../../redis/redisManager.js";

const redis = RedisManager.getInstance().getclient();

// Reset Weekly Leaderboard: Every Monday at 00:00
export const resetWeeklyLeaderboard = new CronJob(
    "0 0 * * 1", // At 00:00 on Monday
    async () => {
        logger.info("Running Cron: Reset Weekly Leaderboard");
        try {
            // Remove all elements from the sorted set
            await redis.del("leaderboard:weekly");
            logger.info("Weekly leaderboard reset successfully.");
        } catch (error) {
            logger.error("Error resetting weekly leaderboard:", error);
        }
    },
    null,
    true, // Start immediately
    "Asia/Kolkata" // Adjust timezone as needed
);
