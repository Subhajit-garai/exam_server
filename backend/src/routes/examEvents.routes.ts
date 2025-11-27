import { Router } from "express";
import {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
} from "../controllers/examEvents.controller.js";
import { isAdmin } from "@repo/lib/security/auth.js";

export const examEventsRouter = Router();

examEventsRouter.get("/", getEvents);
examEventsRouter.post("/", isAdmin, createEvent);
examEventsRouter.put("/:id", isAdmin, updateEvent);
examEventsRouter.delete("/:id", isAdmin, deleteEvent);
