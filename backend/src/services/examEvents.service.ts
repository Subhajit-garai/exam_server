import prisma from "@repo/db/index.js";
import { EventStatus } from "@repo/prisma/enums";

export class ExamEventsService {
    async getAllEvents(examyearid: string) {
        return await prisma.examEvent.findMany({
            where: {
                exam_year: examyearid,
            },
            orderBy: {
                date: "asc",
            },
        });
    }

    async createEvent(data: {
        title: string;
        date: Date;
        description?: string;
        status: EventStatus;
        notification?: string;
        exam_year: string;
    }) {
        return await prisma.examEvent.create({
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

    async updateEvent(id: string, data: {
        title?: string;
        date?: Date;
        description?: string;
        status?: EventStatus;
        notification?: string;
        exam_year?: string;
    }) {
        return await prisma.examEvent.update({
            where: { id },
            data: {
                ...data,
                date: data.date ? new Date(data.date) : undefined,
            },
        });
    }

    async deleteEvent(id: string) {
        return await prisma.examEvent.delete({
            where: { id },
        });
    }
}
