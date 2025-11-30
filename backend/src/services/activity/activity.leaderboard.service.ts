import prisma from "@repo/db/index.js";
import { RedisProvider } from "../../lib/radisProvider.js";

export class ActivityLeaderboardService {
    private redis = RedisProvider.getInstance().getclient();

    async updateLeaderboard(userId: string, xp: number) {
        // Weekly Leaderboard
        await this.redis.zincrby("leaderboard:weekly", xp, userId);

        // Global Leaderboard
        await this.redis.zincrby("leaderboard:global", xp, userId);
    }

    async getLeaderboard(type: 'weekly' | 'global' = 'weekly', limit: number = 10) {
        const key = `leaderboard:${type}`;
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

    async getUserXP(userId: string): Promise<number> {
        const globalScore = await this.redis.zscore("leaderboard:global", userId);
        return globalScore ? parseInt(globalScore) : 0;
    }
}
