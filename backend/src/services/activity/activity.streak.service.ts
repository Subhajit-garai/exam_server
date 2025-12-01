import prisma from "@repo/db/index.js";
import dayjs from "dayjs";

import { ActivityLeaderboardService } from "./activity.leaderboard.service.js";

export class ActivityStreakService {
    private leaderboardService = new ActivityLeaderboardService();

    async updateStreak(userId: string) {
        const today = dayjs().startOf('day');
        const yesterday = today.subtract(1, 'day');

        let streakRecord = await prisma.userStreak.findUnique({
            where: { userId },
        });

        if (!streakRecord) {
            streakRecord = await prisma.userStreak.create({
                data: { userId, streak: 1, maxStreak: 1, lastActivity: new Date() },
            });
            await this.leaderboardService.updateStreakLeaderboard(userId, 1);
            return;
        }

        const lastActivityDate = streakRecord.lastActivity ? dayjs(streakRecord.lastActivity).startOf('day') : null;

        if (lastActivityDate && lastActivityDate.isSame(today)) {
            // Already active today, do nothing to streak count
        } else if (lastActivityDate && lastActivityDate.isSame(yesterday)) {
            // Continued streak
            await prisma.userStreak.update({
                where: { userId },
                data: {
                    streak: streakRecord.streak + 1,
                    maxStreak: Math.max(streakRecord.streak + 1, streakRecord.maxStreak),
                    lastActivity: new Date(),
                },
            });
            await this.leaderboardService.updateStreakLeaderboard(userId, streakRecord.streak + 1);
        } else {
            // Streak broken (or first time after long break)
            await prisma.userStreak.update({
                where: { userId },
                data: {
                    streak: 1,
                    lastActivity: new Date(),
                },
            });
            await this.leaderboardService.updateStreakLeaderboard(userId, 1);
        }
    }

    async getUserStreak(userId: string) {
        const streak = await prisma.userStreak.findUnique({ where: { userId } });

        let currentStreak = streak?.streak || 0;
        if (streak?.lastActivity) {
            const last = dayjs(streak.lastActivity).startOf('day');
            const yesterday = dayjs().startOf('day').subtract(1, 'day');
            // If last activity was before yesterday, streak is effectively broken (0)
            if (last.isBefore(yesterday)) {
                currentStreak = 0;
            }
        }

        return {
            streak: currentStreak,
            maxStreak: streak?.maxStreak || 0
        };
    }
}
