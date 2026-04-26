import { Router } from "express";
import { dislike, getTopic, getAllNoteSubjectByExam, getAllNoteTopic, getNote, like, getAllNoteSubjectByCategory } from "../controllers/note.controller.js";

export const notePublicRouter = Router();

// Public Routes
notePublicRouter.get("/note/:subject/:topic", getNote)
notePublicRouter.get("/topic", getTopic)
notePublicRouter.get("/subject/all", getAllNoteSubjectByExam)
notePublicRouter.get("/subject/all/:category", getAllNoteSubjectByCategory)
notePublicRouter.get("/:subject/topic/all", getAllNoteTopic)
notePublicRouter.post("/like", like)
notePublicRouter.post("/dislike", dislike)
notePublicRouter.get("/readCount") // Is this a valid route handler? It was incomplete in original file.

