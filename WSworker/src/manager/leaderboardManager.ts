import { user_data } from "@/user.js";
import { logger } from "@/utils/logger.js";
import { RedisProvider } from "@/utils/redisProvider.js";
import { leaderboard_type } from "./quizManager.js";



export class LeaderboardManager {
    private static instance: LeaderboardManager;
    private redisProvider: RedisProvider;
    private redis: any; // Direct ioredis client

    public static getInstance() {
        if (!this.instance) {
            this.instance = new LeaderboardManager();
        }
        return this.instance;
    }

    private constructor() {
        this.redisProvider = RedisProvider.getInstance();
        this.redis = this.redisProvider.getclient();
    }

    getRedisClient() {
        return this.redisProvider;
    }

    async updateLeaderboard(quizId: string, userId: string, score: number) {
        // update quiz leaderboard
        const key = `quiz:leaderboard:${quizId}`;


        const pipeline = this.redis.pipeline();

        pipeline.zadd(key, score, userId);
        pipeline.expire(key, 86400); // Ensure TTL

        // push in queue for daily, monthly, all time leaderboard

        await pipeline.exec();
    }

    async processQuizLeaderboard(quizId: string) {
        await this.redis.lpush("leaderboard:queue", JSON.stringify({ quizId, date: new Date().toISOString() }));
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
            let userDetails: user_data = { name: "Unknown", avatar: "" };

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