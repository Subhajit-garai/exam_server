import { CompleteActivityInput, CreateActivityInput } from "../zod/activity.zod.js";
import { db } from "@repo/db/index.js";
import { user_activities, daily_challenges, user_streaks, badges, user_badges } from "@repo/db/schema/activity.js";
import { primes, users } from "@repo/db/schema/user.js";
import { BadgeRule } from "@repo/db/schema/enums.js";
import { eq, desc as drizzleDesc, sql, and, count } from "drizzle-orm";
import { RedisManager } from "@/lib/redis/redisManager.js";
import dayjs from "dayjs";

export type activity_time_range = "today" | 'weekly' | 'global';

export class ActivityService {
    private redis = RedisManager.getInstance().getclient();

    constructor() { }

    /**
     * Get today's daily challenge.
     */
    async getDailyChallenge() {
        const today = dayjs().startOf('day').toDate();
        const cacheKey = `daily-challenge:${dayjs().format('YYYY-MM-DD')}`;

        const cached = await this.redis.get(cacheKey);
        if (cached) return JSON.parse(cached);

        let [challenge] = await db.select().from(daily_challenges).where(eq(daily_challenges.date, today)).limit(1);

        if (!challenge) {
            // Try to create it if it doesn't exist
            // Using onConflictDoNothing to handle concurrent requests
            await db.insert(daily_challenges).values({
                date: today,
                title: "Daily Challenge",
                description: "Complete a quiz or test to keep your streak alive!",
                xp: 50,
                created_by: "system",
                updated_at: new Date()
            }).onConflictDoNothing();

            // Fetch again to be sure we have the object
            [challenge] = await db.select().from(daily_challenges).where(eq(daily_challenges.date, today)).limit(1);
        }


        await this.redis.set(cacheKey, JSON.stringify(challenge), "EX", 86400);
        return challenge;
    }

    /**
     * Get daily challenge history.
     */
    async getDailyChallengeHistory() {
        return db.select().from(daily_challenges).orderBy(drizzleDesc(daily_challenges.date)).limit(20);
    }

    // Leaderboard Logic
    async updateXPLeaderboard(userId: string, xp: number) {
        await this.redis.zincrby("leaderboard:xp:weekly", xp, userId);
        await this.redis.zincrby("leaderboard:xp:global", xp, userId);
    }

    async updateQuizLeaderboard(userId: string, score: number) {
        await this.redis.zincrby("leaderboard:quiz:weekly", score, userId);
        await this.redis.zincrby("leaderboard:quiz:global", score, userId);
    }

    async updateStreakLeaderboard(userId: string, streak: number) {
        await this.redis.zadd("leaderboard:streak", streak, userId);
    }

    private async fetchLeaderboard(key: string, limit: number) {
        const result = await this.redis.zrevrange(key, 0, limit - 1, "WITHSCORES");
        const leaderboard = [];
        for (let i = 0; i < result.length; i += 2) {
            const userId = result[i];
            const score = parseInt(result[i + 1]);
            const [user] = await db.select({ name: users.name, id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
            if (user) leaderboard.push({ user, score, rank: (i / 2) + 1 });
        }
        return leaderboard;
    }

    async getXPLeaderboard(type: activity_time_range = 'weekly', limit: number = 10) {
        return this.fetchLeaderboard(`leaderboard:xp:${type}`, limit);
    }

    async getQuizLeaderboard(type: activity_time_range = 'weekly', limit: number = 10) {
        return this.fetchLeaderboard(`leaderboard:quiz:${type}`, limit);
    }

    async getStreakLeaderboard(limit: number = 10) {
        return this.fetchLeaderboard("leaderboard:streak", limit);
    }

    async getUserXP(userId: string): Promise<number> {
        const globalScore = await this.redis.zscore("leaderboard:xp:global", userId);
        return globalScore ? parseInt(globalScore) : 0;
    }

    // Streak Logic
    async updateStreak(userId: string) {
        const today = dayjs().startOf('day');
        const yesterday = today.subtract(1, 'day');

        const [streakRecord] = await db.select().from(user_streaks).where(eq(user_streaks.user_id, userId)).limit(1);

        if (!streakRecord) {
            await db.insert(user_streaks).values({
                user_id: userId,
                streak: 1,
                max_streak: 1,
                last_activity: new Date(),
                updated_at: new Date()
            });
            await this.updateStreakLeaderboard(userId, 1);
            return;
        }

        const lastActivityDate = streakRecord.last_activity ? dayjs(streakRecord.last_activity).startOf('day') : null;

        if (lastActivityDate && lastActivityDate.isSame(today)) {
            // No-op
        } else if (lastActivityDate && lastActivityDate.isSame(yesterday)) {
            await db.update(user_streaks).set({
                streak: streakRecord.streak + 1,
                max_streak: Math.max(streakRecord.streak + 1, streakRecord.max_streak),
                last_activity: new Date(),
                updated_at: new Date()
            }).where(eq(user_streaks.user_id, userId));
            await this.updateStreakLeaderboard(userId, streakRecord.streak + 1);
        } else {
            await db.update(user_streaks).set({
                streak: 1,
                last_activity: new Date(),
                updated_at: new Date()
            }).where(eq(user_streaks.user_id, userId));
            await this.updateStreakLeaderboard(userId, 1);
        }
    }

    async getUserStreak(userId: string) {
        const [streak] = await db.select().from(user_streaks).where(eq(user_streaks.user_id, userId)).limit(1);

        let currentStreak = streak?.streak || 0;
        if (streak?.last_activity) {
            const last = dayjs(streak.last_activity).startOf('day');
            const yesterday = dayjs().startOf('day').subtract(1, 'day');
            if (last.isBefore(yesterday)) currentStreak = 0;
        }

        return { streak: currentStreak, maxStreak: streak?.max_streak || 0 };
    }

    // Badge Logic
    async checkBadges(userId: string) {
        const [streakRecord] = await db.select().from(user_streaks).where(eq(user_streaks.user_id, userId)).limit(1);
        if (streakRecord && streakRecord.streak >= 7) {
            await this.assignBadge(userId, "7_DAY_STREAK", "On Fire!", "Maintained a 7-day streak");
        }

        const score = await this.redis.zscore("leaderboard:xp:global", userId);
        if (score && parseInt(score) >= 1000) {
            await this.assignBadge(userId, "1K_XP_CLUB", "High Roller", "Earned 1000 XP");
        }

        const activityCountResult = await db.select({ value: count() }).from(user_activities).where(eq(user_activities.user_id, userId));
        const activityCount = activityCountResult[0].value;
        if (activityCount >= 10) {
            await this.assignBadge(userId, "ACTIVE_USER_10", "Getting Started", "Completed 10 activities");
        }
    }

    private async assignBadge(userId: string, badgeName: string, description: string, displayName: string) {
        let [badge] = await db.select().from(badges).where(eq(badges.name, badgeName)).limit(1);
        if (!badge) {
            const [newBadge] = await db.insert(badges).values({
                name: badgeName,
                description: description,
                rule_type: "STREAK_COUNT",
                condition: {},
                xp_bonus: 100,
                updated_at: new Date()
            }).returning();
            badge = newBadge;
        }

        const [existing] = await db.select().from(user_badges).where(and(eq(user_badges.user_id, userId), eq(user_badges.badge_id, badge.id))).limit(1);

        if (!existing) {
            await db.insert(user_badges).values({ user_id: userId, badge_id: badge.id });
        }
    }

    async getUserBadges(userId: string) {
        const badgesData = await db.select({ badge: badges })
            .from(user_badges)
            .innerJoin(badges, eq(user_badges.badge_id, badges.id))
            .where(eq(user_badges.user_id, userId));
        return badgesData.map((b: any) => b.badge);
    }

    /**
     * Calculate XP with multipliers based on user's premium status.
     */
    async calculateXP(userId: string, baseXP: number): Promise<number> {
        const [userPrime] = await db.select().from(primes).where(eq(primes.user_id, userId)).limit(1);
        let multiplier = 1.0;

        if (userPrime) {
            switch (userPrime.status) {
                case "Bronze": multiplier = 1.1; break;
                case "Silver": multiplier = 1.25; break;
                case "Gold": multiplier = 1.5; break;
            }
        }

        return Math.round(baseXP * multiplier);
    }

    /**
     * Record a completed activity, update streak, XP, and check badges.
     */
    async completeActivity(input: CompleteActivityInput) {
        const { userId, activityType, xpEarned, metadata } = input;

        const finalXP = await this.calculateXP(userId, xpEarned);

        await db.insert(user_activities).values({
            user_id: userId,
            date: new Date(),
            type: activityType as any,
            xp: finalXP,
            meta: metadata || {},
        });

        await this.updateStreak(userId);
        await this.updateXPLeaderboard(userId, finalXP);
        await this.checkBadges(userId);

        return { message: "Activity completed", xpEarned: finalXP, baseXP: xpEarned };
    }

    async getUserStats(userId: string) {
        const streakData = await this.getUserStreak(userId);
        const xp = await this.getUserXP(userId);
        const badgesData = await this.getUserBadges(userId);

        return {
            streak: streakData.streak,
            maxStreak: streakData.maxStreak,
            xp: xp,
            badges: badgesData
        };
    }

    /**
     * Create a new activity log
     */
    async createActivity(userId: string, data: CreateActivityInput, tx?: any) {
        const dbInstance = tx || db;

        const [newActivity] = await dbInstance.insert(user_activities).values({
            user_id: userId,
            date: new Date(),
            type: data.type ?? "OTHER",
            xp: 0,
            meta: {
                title: data.title,
                score: data.score || "Pending",
                status: data.status,
            },
        }).returning();

        return newActivity;
    }

    /**
     * Get recent activities for a user
     */
    async getRecentActivities(userId: string, limit: number = 10) {
        const activities = await db.select().from(user_activities).where(eq(user_activities.user_id, userId)).orderBy(drizzleDesc(user_activities.date)).limit(limit);

        return activities.map(activity => {
            const meta = activity.meta as any || {};
            return {
                title: meta.title || activity.type,
                score: meta.score || "Pending",
                status: meta.status || "Completed",
                completedAt: activity.date,
                activityType: meta.originalType || activity.type.toLowerCase(),
            };
        });
    }

    /**
     * Get all user rewards (badges, etc.)
     */
    async getUserRewards(userId: string) {
        const badgesData = await this.getUserBadges(userId);
        return { badges: badgesData };
    }

    /**
     * Get aggregated activity data for heatmap.
     */
    async getActivityHeatmap(userId: string) {
        const activities = await db.select({
            date: sql<string>`DATE(${user_activities.date})`,
            count: sql<number>`cast(count(${user_activities.id}) as int)`
        })
            .from(user_activities)
            .where(eq(user_activities.user_id, userId))
            .groupBy(sql`DATE(${user_activities.date})`)
            .orderBy(sql`DATE(${user_activities.date}) asc`);

        return activities.map(entry => ({
            date: new Date(entry.date).toISOString().split('T')[0],
            count: entry.count,
            level: this.calculateHeatmapLevel(entry.count)
        }));
    }

    private calculateHeatmapLevel(count: number): number {
        if (count === 0) return 0;
        if (count <= 2) return 1;
        if (count <= 5) return 2;
        if (count <= 10) return 3;
        return 4;
    }
}


