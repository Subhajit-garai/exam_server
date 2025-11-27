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
}
