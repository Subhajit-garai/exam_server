
import { Router } from "express";
import { getAllEvents, createEvent } from "../controllers/event.controller.js";
import { isAdmin } from "@repo/lib/security/auth.js";
export const eventRouter = Router();



eventRouter.get("/all", isAdmin, getAllEvents)
eventRouter.post("/create", isAdmin, createEvent)



