import { Router } from "express";
import { isAdmin } from "@repo/lib/security/auth.js";
import {
    CreateSyllabus, fetchAllsyllabus, getSyllabusByid, addSubject,
    formatedSyllabus, removeSubject, addTopic, removeTopic, fetchAllsyllabus_id,
    fetchAllsyllabusExamYearid, DeleteSyllabus,
    getDetaildformatedSyllabus
} from "@/controllers/syllabus.controller.js";





export const syllabusRouter = Router();

syllabusRouter.get("/get/formated", formatedSyllabus)
syllabusRouter.get("/get/detailed/formated", getDetaildformatedSyllabus)

syllabusRouter.get("/get/all", isAdmin, fetchAllsyllabus);
syllabusRouter.get("/get/id", isAdmin, fetchAllsyllabus_id);
syllabusRouter.get("/get/examyearid", isAdmin, fetchAllsyllabusExamYearid);
syllabusRouter.get("/name/get/all", isAdmin, fetchAllsyllabus);

syllabusRouter.post("/admin/create", isAdmin, CreateSyllabus);
syllabusRouter.delete("/admin/delete", isAdmin, DeleteSyllabus);

syllabusRouter.post("/admin/add/subject", isAdmin, addSubject);
syllabusRouter.delete("/admin/remove/subject", isAdmin, removeSubject);
syllabusRouter.post("/admin/add/topic", isAdmin, addTopic);
syllabusRouter.delete("/admin/remove/topic", isAdmin, removeTopic);








//user

// syllabusRouter.get("/syllabus", getSyllabus);   // breaked update !!!
syllabusRouter.get("/get/syllabus/id", getSyllabusByid);




