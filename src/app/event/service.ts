import { db } from "@repo/db/index.js";
import { events } from "@repo/db/schema/events.js";
import { eq } from "drizzle-orm";

export class EventService {
    async createEvent(data: any) {
        const { type, description, conditions, payload, created_by, runs, run_at } = data;

        const [response] = await db.insert(events).values({
            type,
            description,
            conditions,
            payload,
            created_by,
            runs,
            run_at,
        }).returning();

        if (!response) {
            throw Error("server error, event not created");
        }
        return response;
    }

    async getAllEvents() {
        const allEvents = await db.select().from(events);
        if (!allEvents) {
            throw Error("server error");
        }
        return allEvents;
    }

    async updateEvent(id: string, data: any) {
        const { type, description, conditions, payload, created_by, runs, run_at, isActive } = data;

        const [response] = await db.update(events).set({
            type,
            description,
            conditions,
            payload,
            created_by,
            runs,
            run_at,
            is_active: isActive
        }).where(eq(events.id, id)).returning();

        if (!response) {
            throw Error("server error, event not updated");
        }
        return response;
    }

    async deleteEvent(id: string) {
        const [response] = await db.delete(events).where(eq(events.id, id)).returning();

        if (!response) {
            throw Error("server error, event not deleted");
        }
        return response;
    }
}
