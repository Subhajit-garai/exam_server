import { QueueManager } from "@/lib/queue/queueManager.js";
import { RedisManager } from "@/lib/redis/redisManager.js";
import { logger } from "@/utils/logger.js";

type leaderboard_type = {
    name: string;
    avatar: string | null;
    score: string;
}

export class LeaderboardManager {
    private static instance: LeaderboardManager;
    private queueManager: QueueManager;
    private redis: any;

    public static getInstance() {
        if (!this.instance) {
            this.instance = new LeaderboardManager();
        }
        return this.instance;
    }

    private constructor() {
        this.queueManager = QueueManager.getInstance();
        this.redis = RedisManager.getInstance().getclient();
    }

    async updateLeaderboard(quizId: string, userId: string, score: number) {
        const key = `quiz:leaderboard:${quizId}`;
        const pipeline = this.redis.pipeline();
        pipeline.zincrby(key, score, userId);
        pipeline.expire(key, 86400);
        await pipeline.exec();
    }

    async getLeaderBoard(quizId: string): Promise<leaderboard_type[]> {
        const key = `quiz:leaderboard:${quizId}`;
        const data = await this.redis.zrevrange(key, 0, -1, "WITHSCORES");

        if (!data || data.length === 0) {
            logger.error(`[LEADERBOARD] No data found for ${quizId}`);
            return [];
        }

        const userIds: string[] = [];
        const scores: string[] = [];

        for (let i = 0; i < data.length; i += 2) {
            userIds.push(data[i]);
            scores.push(data[i + 1]);
        }

        const profileKeys = userIds.map((id) => `user:profile:${id}`);
        const userDetailsList = await this.redis.mget(profileKeys);

        const leaderboard: leaderboard_type[] = [];

        for (let i = 0; i < userIds.length; i++) {
            let userDetails: any = { name: "Unknown", avatar: "" };

            if (userDetailsList[i]) {
                try {
                    userDetails = JSON.parse(userDetailsList[i]);
                } catch {
                    logger.error(`[LEADERBOARD] Failed to parse user details for ${userIds[i]}`);
                }
            }

            leaderboard.push({
                name: userDetails.name,
                avatar: userDetails.avatar ?? "P",
                score: scores[i],
            });
        }

        return leaderboard;
    }
}
