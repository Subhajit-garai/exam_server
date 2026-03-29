import prisma from "@repo/db/index.js";
import { RedisProvider } from "../../lib/radisProvider.js";
import dayjs from "dayjs";

export class ActivityChallengeService {
    private redis = RedisProvider.getInstance().getclient();

    /**
     * Get today's daily challenge.
     * Checks Redis cache first, then DB.
     */
    async getDailyChallenge() {
        const today = dayjs().startOf('day').toDate();
        const cacheKey = `daily-challenge:${dayjs().format('YYYY-MM-DD')}`;

        // 1. Check Redis
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        // 2. Fetch from DB
        let challenge = await prisma.dailyChallenge.findUnique({
            where: { date: today },
        });

        if (!challenge) {
            // Create a dummy challenge for now if not found
            challenge = await prisma.dailyChallenge.create({
                data: {
                    date: today,
                    title: "Daily Challenge",
                    description: "Complete a quiz or test to keep your streak alive!",
                    xp: 50,
                    createdBy: "system"
                }
            })
        }

        // 3. Cache in Redis (expire in 24 hours)
        await this.redis.set(cacheKey, JSON.stringify(challenge), "EX", 86400);

        return challenge;
    }

    /**
     * Get daily challenge history.
     */
    async getDailyChallengeHistory() {
        return prisma.dailyChallenge.findMany({
            orderBy: { date: "desc" },
            take: 20
        });
    }
}
