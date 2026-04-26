import { db } from "@repo/db/index.js";
import { exam_timelines } from "@repo/db/schema/examtimeline.js";
import { eq, asc as drizzleAsc } from "drizzle-orm";

export class ExamTimelineService {
    async getAllTimelines(examyearid: string) {
        return await db.select()
            .from(exam_timelines)
            .where(eq(exam_timelines.exam_year_id, examyearid))
            .orderBy(drizzleAsc(exam_timelines.date));
    }

    async getAllDistinctTimelines() {
        return await db.selectDistinctOn([exam_timelines.exam_year_id])
            .from(exam_timelines)
            .orderBy(exam_timelines.exam_year_id, drizzleAsc(exam_timelines.date));
    }

    async createTimeline(data: {
        title: string;
        date: Date | string;
        description?: string;
        status: any;
        notification?: string;
        exam_year: string;
    }) {
        const [created] = await db.insert(exam_timelines).values({
            title: data.title,
            date: new Date(data.date),
            description: data.description,
            status: data.status,
            notification: data.notification,
            exam_year_id: data.exam_year,
            updated_at: new Date()
        }).returning();
        return created;
    }

    async updateTimeline(id: string, data: {
        title?: string;
        date?: Date | string;
        description?: string;
        status?: any;
        notification?: string;
        exam_year?: string;
    }) {
        const [updated] = await db.update(exam_timelines).set({
            ...data,
            date: data.date ? new Date(data.date) : undefined,
            exam_year_id: data.exam_year,
            updated_at: new Date()
        }).where(eq(exam_timelines.id, id)).returning();
        return updated;
    }

    async deleteTimeline(id: string) {
        const [deleted] = await db.delete(exam_timelines).where(eq(exam_timelines.id, id)).returning();
        return deleted;
    }
}

