import prisma from "@repo/db/index.js";
import { ExamStatus } from "@repo/prisma/enums.js";

export class ExamTimelineService {
    async getAllTimelines(examyearid: string) {
        return await prisma.examTimeline.findMany({
            where: {
                exam_year: examyearid,
            },
            orderBy: {
                date: "asc",
            },
        });
    }
    async getAllDistinctTimelines() {
        return await prisma.examTimeline.findMany({
            distinct: ["exam_year"],
            orderBy: {
                date: "asc",
            },
        });
    }

    async createTimeline(data: {
        title: string;
        date: Date | string;
        description?: string;
        status: ExamStatus;
        notification?: string;
        exam_year: string;
    }) {
        return await prisma.examTimeline.create({
            data: {
                title: data.title,
                date: new Date(data.date),
                description: data.description,
                status: data.status,
                notification: data.notification,
                exam_year: data.exam_year,
            },
        });
    }


    async updateTimeline(id: string, data: {
        title?: string;
        date?: Date | string;
        description?: string;
        status?: ExamStatus;
        notification?: string;
        exam_year?: string;
    }) {
        return await prisma.examTimeline.update({
            where: { id },
            data: {
                ...data,
                date: data.date ? new Date(data.date) : undefined,
            },
        });
    }

    async deleteTimeline(id: string) {
        return await prisma.examTimeline.delete({
            where: { id },
        });
    }
}
