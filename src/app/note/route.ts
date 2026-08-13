import { Router } from "express";
import {
  dislike,
  getTopic,
  getAllNoteSubjectByExam,
  getAllNoteTopic,
  getNote,
  like,
  getAllNoteSubjectByCategory,
  CreateSubject,
  CreateTopic,
  getAllVersionOfNote,
  UpdateContentOfTopic,
  DeleteSubject,
  DeleteTopic,
} from "./controller.js";
import { isAdmin } from "@repo/lib/security/auth.js";

export const notePublicRouter = Router();
export const noteAdminRouter = Router();

// Public Routes
notePublicRouter.get("/note/:subject/:topic", getNote);
notePublicRouter.get("/topic", getTopic);
notePublicRouter.get("/subject/all", getAllNoteSubjectByExam);
notePublicRouter.get("/subject/all/:category", getAllNoteSubjectByCategory);
notePublicRouter.get("/:subject/topic/all", getAllNoteTopic);
notePublicRouter.post("/like", like);
notePublicRouter.post("/dislike", dislike);

// Admin Routes (Protected)
noteAdminRouter.get("/getversionlist/:subject/:topic", getAllVersionOfNote);
noteAdminRouter.post("/subject/create", isAdmin, CreateSubject);
noteAdminRouter.post("/topic/create", isAdmin, CreateTopic);
noteAdminRouter.delete("/subject/delete", isAdmin, DeleteSubject);
noteAdminRouter.delete("/topic/delete", isAdmin, DeleteTopic);
noteAdminRouter.put("/updatecontent", UpdateContentOfTopic);
