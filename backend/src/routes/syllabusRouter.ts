import { Router } from "express";
import { isAdmin } from "@repo/lib/security/auth.js";
import {
    CreateSyllabus, fetchAllsyllabus, getSyllabusByid, addSubject,
    formatedSyllabus, removeSubject, addTopic, removeTopic, fetchAllsyllabus_id,
    fetchAllsyllabusExamYearid, DeleteSyllabus,
    getDetaildformatedSyllabus
} from "@/controllers/syllabus.controller.js";





export const syllabusAdminRouter = Router();
export const syllabusPublicRouter = Router();

// Public Routes
syllabusPublicRouter.get("/get/formated", formatedSyllabus)
syllabusPublicRouter.get("/get/detailed/formated", getDetaildformatedSyllabus)
syllabusPublicRouter.get("/get/syllabus/id", getSyllabusByid);





// Admin Routes (Protected)
syllabusAdminRouter.get("/get/all", isAdmin, fetchAllsyllabus);
syllabusAdminRouter.get("/get/id", isAdmin, fetchAllsyllabus_id);
syllabusAdminRouter.get("/get/examyearid", isAdmin, fetchAllsyllabusExamYearid);
syllabusAdminRouter.get("/name/get/all", isAdmin, fetchAllsyllabus);
syllabusAdminRouter.post("/create", isAdmin, CreateSyllabus);
syllabusAdminRouter.delete("/delete", isAdmin, DeleteSyllabus);
syllabusAdminRouter.post("/add/subject", isAdmin, addSubject);
syllabusAdminRouter.delete("/remove/subject", isAdmin, removeSubject);
syllabusAdminRouter.post("/add/topic", isAdmin, addTopic);
syllabusAdminRouter.delete("/remove/topic", isAdmin, removeTopic);




