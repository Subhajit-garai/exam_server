import prisma from "@repo/db/index.js";
import { CompleteActivityInput, CreateActivityInput } from "../zod/activity.zod.js";
import { ActivityChallengeService } from "./activity/activity.challenge.service.js";
import { ActivityStreakService } from "./activity/activity.streak.service.js";
import { ActivityLeaderboardService } from "./activity/activity.leaderboard.service.js";
import { ActivityBadgeService } from "./activity/activity.badge.service.js";
import { ActivityType } from "@repo/prisma/enums.js";

export class ActivityService {
    public challenge: ActivityChallengeService;
    public streak: ActivityStreakService;
    public leaderboard: ActivityLeaderboardService;
    public badge: ActivityBadgeService;

    constructor() {
        this.challenge = new ActivityChallengeService();
        this.streak = new ActivityStreakService();
        this.leaderboard = new ActivityLeaderboardService();
        this.badge = new ActivityBadgeService();
    }

    /**
     * Get today's daily challenge.
     */
    async getDailyChallenge() {
        return this.challenge.getDailyChallenge();
    }

    /**
     * Get daily challenge history.
     */
    async getDailyChallengeHistory() {
        return this.challenge.getDailyChallengeHistory();
    }

    /**
     * Calculate XP with multipliers based on user's premium status.
     */
    async calculateXP(userId: string, baseXP: number): Promise<number> {
        const prime = await prisma.prime.findUnique({ where: { userid: userId } });
        let multiplier = 1.0;

        if (prime) {
            switch (prime.status) {
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

        // Apply Premium Multiplier
        const finalXP = await this.calculateXP(userId, xpEarned);

        // 1. Log Activity
        await prisma.userActivity.create({
            data: {
                userId,
                date: new Date(),
                type: activityType,
                xp: finalXP,
                meta: metadata || {},
            },
        });

        // 2. Update Streak
        await this.streak.updateStreak(userId);

        // 3. Update XP and Leaderboard
        await this.leaderboard.updateLeaderboard(userId, finalXP);

        // 4. Check Badges
        await this.badge.checkBadges(userId);

        return { message: "Activity completed", xpEarned: finalXP, baseXP: xpEarned };
    }

    async getLeaderboard(type: 'weekly' | 'global' = 'weekly', limit: number = 10) {
        return this.leaderboard.getLeaderboard(type, limit);
    }

    async getUserStats(userId: string) {
        const streakData = await this.streak.getUserStreak(userId);
        const xp = await this.leaderboard.getUserXP(userId);
        const badges = await this.badge.getUserBadges(userId);

        return {
            streak: streakData.streak,
            maxStreak: streakData.maxStreak,
            xp: xp,
            badges: badges
        };
    }

    /**
     * Create a new activity log (Simple version for RecentActivity replacement)
     */
    async createActivity(userId: string, data: CreateActivityInput, tx?: any) {
        const db = tx || prisma;

        const newActivity = await db.userActivity.create({
            data: {
                userId,
                date: new Date(),
                type: data.type ?? ActivityType.OTHER,
                xp: 0,
                meta: {
                    title: data.title,
                    score: data.score || "Pending",
                    status: data.status,
                },
            },
        });

        return newActivity;
    }
    /**
     * Get recent activities for a user
     */
    async getRecentActivities(userId: string, limit: number = 10) {
        const activities = await prisma.userActivity.findMany({
            where: {
                userId,
            },
            orderBy: {
                date: "desc",
            },
            take: limit,
        });

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
        const badges = await this.badge.getUserBadges(userId);

        // Future: Add other rewards here (coupons, etc.)

        return {
            badges,
            // otherRewards: [] 
        };
    }


    /**
     * Get aggregated activity data for heatmap.
     * Returns an array of { date: string, count: number, level: number }
     */
    async getActivityHeatmap(userId: string) {
        const activities = await prisma.userActivity.groupBy({
            by: ['date'],
            where: { userId },
            _count: { id: true },
            orderBy: { date: 'asc' }
        });

        return activities.map(entry => ({
            date: entry.date.toISOString().split('T')[0], // YYYY-MM-DD
            count: entry._count.id,
            level: this.calculateHeatmapLevel(entry._count.id)
        }));
    }

    // Helper for intensity
    private calculateHeatmapLevel(count: number): number {
        if (count === 0) return 0;
        if (count <= 2) return 1;
        if (count <= 5) return 2;
        if (count <= 10) return 3;
        return 4;
    }
}
