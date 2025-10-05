import { Router } from "express";
import { CreateSubject, CreateTopic, dislike,getTopic, getAllNoteSubject, getAllNoteTopic, getAllVersionOfNote, getNote, like, UpdateContentOfTopic, DeleteSubject } from "../controllers/note.controller";
import { isAdmin } from "../../lib/auth";

export const noteRouter = Router()


noteRouter.get("/getnote/:subject/:topic",getNote)
noteRouter.get("/gettopic",getTopic)
noteRouter.get("/allsubject" ,getAllNoteSubject)
noteRouter.get("/alltopic/:subject" ,getAllNoteTopic)
noteRouter.get("/admin/getversionlist/:subject/:topic",getAllVersionOfNote)

noteRouter.post("/like",like)
noteRouter.post("/dislike",dislike)
noteRouter.get("/readCount")
noteRouter.post("/admin/subject/create", isAdmin ,CreateSubject)
noteRouter.delete("/admin/subject/delete", isAdmin,DeleteSubject)
noteRouter.post("/admin/topic/create", isAdmin ,CreateTopic)
noteRouter.delete("/admin/topic/delete", isAdmin ,CreateTopic)
noteRouter.put("/admin/updatecontent",UpdateContentOfTopic)

