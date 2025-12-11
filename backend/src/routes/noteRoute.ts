import { Router } from "express";
import { CreateSubject, CreateTopic, dislike, getTopic, getAllNoteSubjectByExam, getAllNoteTopic, getAllVersionOfNote, getNote, like, UpdateContentOfTopic, DeleteSubject } from "../controllers/note.controller.js";
import { isAdmin } from "@repo/lib/security/auth.js";

export const noteAdminRouter = Router();
export const notePublicRouter = Router();

// Public Routes
notePublicRouter.get("/getnote/:subject/:topic", getNote)
notePublicRouter.get("/gettopic", getTopic)
notePublicRouter.get("/allsubject", getAllNoteSubjectByExam)
notePublicRouter.get("/alltopic/:slug", getAllNoteTopic)
notePublicRouter.post("/like", like)
notePublicRouter.post("/dislike", dislike)
notePublicRouter.get("/readCount") // Is this a valid route handler? It was incomplete in original file.

// Admin Routes (Protected)
noteAdminRouter.get("/getversionlist/:subject/:topic", getAllVersionOfNote)
noteAdminRouter.post("/subject/create", isAdmin, CreateSubject)
noteAdminRouter.delete("/subject/delete", isAdmin, DeleteSubject)
noteAdminRouter.post("/topic/create", isAdmin, CreateTopic)
noteAdminRouter.delete("/topic/delete", isAdmin, CreateTopic)
noteAdminRouter.put("/updatecontent", UpdateContentOfTopic)

