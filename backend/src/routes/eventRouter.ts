
import { Router } from "express";
import { getAllEvents ,createEvent } from "../controllers/event.controller";
import { isAdmin } from "@repo/lib/security/auth";
export const eventRouter = Router();



eventRouter.get("/all",isAdmin, getAllEvents)
eventRouter.post("/create",isAdmin,createEvent)



