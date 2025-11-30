import { CronJob } from "cron";
import { RedisProvider } from "../radisProvider.js";

const redis = RedisProvider.getInstance().getclient();

// Reset Weekly Leaderboard: Every Monday at 00:00
export const resetWeeklyLeaderboard = new CronJob(
    "0 0 * * 1", // At 00:00 on Monday
    async () => {
        console.log("Running Cron: Reset Weekly Leaderboard");
        try {
            // Remove all elements from the sorted set
            await redis.del("leaderboard:weekly");
            console.log("Weekly leaderboard reset successfully.");
        } catch (error) {
            console.error("Error resetting weekly leaderboard:", error);
        }
    },
    null,
    true, // Start immediately
    "Asia/Kolkata" // Adjust timezone as needed
);
