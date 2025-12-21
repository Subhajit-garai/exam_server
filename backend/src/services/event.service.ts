import prisma from "@repo/db/index.js";

export class EventService {
    async createEvent(data: any) {
        const { type, description, conditions, payload, created_by, runs, run_at } = data;

        const response = await prisma.events.create({
            data: {
                type,
                description,
                conditions,
                payload,
                created_by,
                runs,
                run_at,
            },
        });

        if (!response) {
            throw Error("server error, event not created");
        }
        return response;
    }

    async getAllEvents() {
        const allEvents = await prisma.events.findMany({});
        if (!allEvents) {
            throw Error("server error");
        }
        return allEvents;
    }

    async updateEvent(id: string, data: any) {
        const { type, description, conditions, payload, created_by, runs, run_at, isActive } = data;

        const response = await prisma.events.update({
            where: { id },
            data: {
                type,
                description,
                conditions,
                payload,
                created_by,
                runs,
                run_at,
                isActive
            },
        });

        if (!response) {
            throw Error("server error, event not updated");
        }
        return response;
    }

    async deleteEvent(id: string) {
        const response = await prisma.events.delete({
            where: { id },
        });

        if (!response) {
            throw Error("server error, event not deleted");
        }
        return response;
    }
}
