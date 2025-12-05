import { Router } from "express";
import { CreateSubject, CreateTopic, dislike, getTopic, getAllNoteSubjectByExam, getAllNoteTopic, getAllVersionOfNote, getNote, like, UpdateContentOfTopic, DeleteSubject } from "../controllers/note.controller.js";
import { isAdmin } from "@repo/lib/security/auth.js";

export const noteRouter = Router()


noteRouter.get("/getnote/:subject/:topic", getNote)
noteRouter.get("/gettopic", getTopic)
noteRouter.get("/allsubject", getAllNoteSubjectByExam)
noteRouter.get("/alltopic/:slug", getAllNoteTopic)


noteRouter.post("/like", like)
noteRouter.post("/dislike", dislike)
noteRouter.get("/readCount")


noteRouter.get("/admin/getversionlist/:subject/:topic", getAllVersionOfNote)
noteRouter.post("/admin/subject/create", isAdmin, CreateSubject)
noteRouter.delete("/admin/subject/delete", isAdmin, DeleteSubject)
noteRouter.post("/admin/topic/create", isAdmin, CreateTopic)
noteRouter.delete("/admin/topic/delete", isAdmin, CreateTopic)
noteRouter.put("/admin/updatecontent", UpdateContentOfTopic)

