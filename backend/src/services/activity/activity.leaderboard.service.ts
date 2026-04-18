import prisma from "@repo/db/index.js";
import { RedisProvider } from "../../lib/redisProvider.js";

export type activity_time_range = "today" | 'weekly' | 'global'
export class ActivityLeaderboardService {
    private redis = RedisProvider.getInstance().getclient();

    async updateXPLeaderboard(userId: string, xp: number) {
        // Weekly Leaderboard
        await this.redis.zincrby("leaderboard:xp:weekly", xp, userId);

        // Global Leaderboard
        await this.redis.zincrby("leaderboard:xp:global", xp, userId);
    }

    // Alias for backward compatibility if needed, or just use the new name
    async updateLeaderboard(userId: string, xp: number) {
        return this.updateXPLeaderboard(userId, xp);
    }
    async updateQuizLeaderboard(userId: string, score: number) {
        // Weekly Quiz Leaderboard
        await this.redis.zincrby("leaderboard:quiz:weekly", score, userId);

        // Global Quiz Leaderboard
        await this.redis.zincrby("leaderboard:quiz:global", score, userId);
    }

    async updateStreakLeaderboard(userId: string, streak: number) {
        // Streak is usually just current streak, so we might just set it or update it.
        // ZADD updates the score (streak) for the member (userId).
        await this.redis.zadd("leaderboard:streak", streak, userId);
    }

    private async fetchLeaderboard(key: string, limit: number) {
        // Get top users: ZREVRANGE key 0 limit WITHSCORES
        const result = await this.redis.zrevrange(key, 0, limit - 1, "WITHSCORES");

        // Result is array [userId, score, userId, score...]
        const leaderboard = [];
        for (let i = 0; i < result.length; i += 2) {
            const userId = result[i];
            const score = parseInt(result[i + 1]);
            // Fetch user details
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { name: true, id: true }
            });
            if (user) {
                leaderboard.push({ user, score, rank: (i / 2) + 1 });
            }
        }
        return leaderboard;
    }

    async getXPLeaderboard(type: activity_time_range = 'weekly', limit: number = 10) {
        return this.fetchLeaderboard(`leaderboard:xp:${type}`, limit);
    }

    async getQuizLeaderboard(type: activity_time_range = 'weekly', limit: number = 10) {
        return this.fetchLeaderboard(`leaderboard:quiz:${type}`, limit);
    }

    async getStreakLeaderboard(type: activity_time_range = 'weekly', limit: number = 10) {
        return this.fetchLeaderboard("leaderboard:streak", limit);
    }

    // // Deprecated or mapped to XP
    // async getLeaderboard(type: activity_time_range = 'weekly', limit: number = 10) {
    //     return this.getXPLeaderboard(type, limit);
    // }

    async getUserXP(userId: string): Promise<number> {
        const globalScore = await this.redis.zscore("leaderboard:xp:global", userId);
        return globalScore ? parseInt(globalScore) : 0;
    }
}
