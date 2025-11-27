import prisma from "@repo/db/index.js";
import { CreateActivityInput } from "../zod/recentActivity.zod.js";

export class ActivityService {
    /**
     * Create a new activity log
     * @param tx - Optional Prisma Transaction Client
     */
    async create(userId: string, data: CreateActivityInput, tx?: any) {
        const db = tx || prisma;

        const newActivity = await db.recentActivity.create({
            data: {
                userId,
                title: data.title,
                activityType: data.activityType,
                score: data.score || "Pending",
                status: data.status,
            },
        });

        return newActivity;
    }

    /**
     * Get recent activities for a user
     */
    async getUserActivities(userId: string, limit: number = 10) {
        const activities = await prisma.recentActivity.findMany({
            where: {
                userId,
            },
            orderBy: {
                completedAt: "desc",
            },
            take: limit,
            select: {
                title: true,
                score: true,
                status: true,
                completedAt: true,
                activityType: true,
            },
        });

        return activities;
    }
}
