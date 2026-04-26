import { Router } from "express";
import { CreateSubject, CreateTopic, getAllVersionOfNote, UpdateContentOfTopic, DeleteSubject, DeleteTopic } from "../../controllers/note.controller.js";
import { isAdmin } from "@repo/lib/security/auth.js";

export const noteAdminRouter = Router();

// Admin Routes (Protected)
noteAdminRouter.get("/getversionlist/:subject/:topic", getAllVersionOfNote)
noteAdminRouter.post("/subject/create", isAdmin, CreateSubject)
noteAdminRouter.post("/topic/create", isAdmin, CreateTopic)
noteAdminRouter.delete("/subject/delete", isAdmin, DeleteSubject)
noteAdminRouter.delete("/topic/delete", isAdmin, DeleteTopic)
noteAdminRouter.put("/updatecontent", UpdateContentOfTopic)
