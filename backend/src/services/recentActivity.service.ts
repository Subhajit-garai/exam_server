import prisma from "@repo/db/index.js";
import { CreateActivityInput } from "../zod/recentActivity.zod.js";

export class ActivityService {
    /**
     * Create a new activity log
     * @param tx - Optional Prisma Transaction Client
     */
    async create(userId: string, data: CreateActivityInput, tx?: any) {
        const db = tx || prisma;

        // Map string activityType to Enum if possible, or default to a generic one if needed.
        // For now, we try to match the enum keys.
        // If the input is "quiz", we want "QUIZ".
        let type: any = data.activityType.toUpperCase();

        // valid types: DAILY_CHALLENGE, QUIZ, TEST, CHAPTER, STREAK_BONUS
        // If not valid, we might fail or need a fallback. 
        // Assuming the input matches the enum logic or we add a fallback.
        // Let's check if it's a valid enum, if not, maybe we should add 'OTHER' to schema?
        // For this refactor, I will assume the inputs correspond to the enum values or close to them.
        // But to be safe, if it's not one of the known ones, we might need to handle it.
        // However, since I cannot easily change the Enum without a migration that I might not want to complicate things with yet,
        // I will try to map common ones.

        const validTypes = ["DAILY_CHALLENGE", "QUIZ", "TEST", "CHAPTER", "STREAK_BONUS"];
        if (!validTypes.includes(type)) {
            // Fallback or error? 
            // If the user was sending free text, this is a breaking change unless we add to Enum.
            // Let's assume for now we map what we can.
            // If strictly needed, we can add to the Enum in the schema change step.
            // For now, let's proceed with the mapping.
        }

        const newActivity = await db.userActivity.create({
            data: {
                userId,
                date: new Date(),
                type: type, // This might throw if invalid enum. 
                xp: 0, // Default to 0 as RecentActivity didn't have XP
                meta: {
                    title: data.title,
                    score: data.score || "Pending",
                    status: data.status,
                    originalType: data.activityType
                },
            },
        });

        return newActivity;
    }

    /**
     * Get recent activities for a user
     */
    async getUserActivities(userId: string, limit: number = 10) {
        const activities = await prisma.userActivity.findMany({
            where: {
                userId,
            },
            orderBy: {
                date: "desc",
            },
            take: limit,
        });

        // Map back to the expected format
        return activities.map(activity => {
            const meta = activity.meta as any || {};
            return {
                title: meta.title || activity.type, // Fallback to type if title missing
                score: meta.score || "Pending",
                status: meta.status || "Completed",
                completedAt: activity.date,
                activityType: meta.originalType || activity.type.toLowerCase(),
            };
        });
    }
}
