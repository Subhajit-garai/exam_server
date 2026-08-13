import { Router } from "express";
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "./controller.js";
import { isAdmin } from "@/lib/security/auth.js";

export const eventAdminRouter = Router();

eventAdminRouter.get("/all", isAdmin, getAllEvents);
eventAdminRouter.post("/create", isAdmin, createEvent);
eventAdminRouter.put("/update/:id", isAdmin, updateEvent);
eventAdminRouter.delete("/delete/:id", isAdmin, deleteEvent);
