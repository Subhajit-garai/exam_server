import prisma from "@repo/db/index.js";
import { RedisProvider } from "../../lib/radisProvider.js";

export class ActivityBadgeService {
    private redis = RedisProvider.getInstance().getclient();

    async checkBadges(userId: string) {
        // 1. Streak Badge (7 days)
        const streakRecord = await prisma.userStreak.findUnique({ where: { userId } });
        if (streakRecord && streakRecord.streak >= 7) {
            await this.assignBadge(userId, "7_DAY_STREAK", "On Fire!", "Maintained a 7-day streak");
        }

        // 2. XP Badge (1000 XP)
        const score = await this.redis.zscore("leaderboard:global", userId);
        if (score && parseInt(score) >= 1000) {
            await this.assignBadge(userId, "1K_XP_CLUB", "High Roller", "Earned 1000 XP");
        }

        // 3. Activity Count Badge (10 Activities)
        const activityCount = await prisma.userActivity.count({ where: { userId } });
        if (activityCount >= 10) {
            await this.assignBadge(userId, "ACTIVE_USER_10", "Getting Started", "Completed 10 activities");
        }
    }

    private async assignBadge(userId: string, badgeName: string, description: string, displayName: string) {
        // Ensure badge exists
        let badge = await prisma.badge.findUnique({ where: { name: badgeName } });
        if (!badge) {
            badge = await prisma.badge.create({
                data: {
                    name: badgeName,
                    description: description,
                    ruleType: "STREAK_COUNT", // Default for now
                    condition: {},
                    xpBonus: 100
                }
            });
        }

        // Check if user already has it
        const existing = await prisma.userBadge.findUnique({
            where: {
                userId_badgeId: {
                    userId,
                    badgeId: badge.id
                }
            }
        });

        if (!existing) {
            await prisma.userBadge.create({
                data: {
                    userId,
                    badgeId: badge.id
                }
            });
        }
    }

    async getUserBadges(userId: string) {
        const badges = await prisma.userBadge.findMany({
            where: { userId },
            include: { badge: true }
        });
        return badges.map((b: any) => b.badge);
    }
}
