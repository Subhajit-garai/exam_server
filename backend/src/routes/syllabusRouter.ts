import { Router } from "express";
import { isAdmin } from "@repo/lib/security/auth";
import { CreateSyllabus, fetchAllsyllabus, getSyllabusByid ,addSubject, formatedSyllabus, removeSubject, addTopic, removeTopic} from "@/controllers/syllabus.controller";





export const syllabusRouter = Router();

syllabusRouter.get("/get/formated",formatedSyllabus)

syllabusRouter.get("/get/all" , isAdmin , fetchAllsyllabus);
syllabusRouter.get("/name/get/all" , isAdmin , fetchAllsyllabus);

syllabusRouter.post("/admin/create" , isAdmin , CreateSyllabus);
syllabusRouter.put("/admin/update" , isAdmin , fetchAllsyllabus);
syllabusRouter.delete("/admin/delete" , isAdmin , fetchAllsyllabus);

syllabusRouter.post("/admin/add/subject" , isAdmin , addSubject);
syllabusRouter.delete("/admin/remove/subject" , isAdmin , removeSubject);
syllabusRouter.post("/admin/add/topic" , isAdmin , addTopic);
syllabusRouter.delete("/admin/remove/topic" , isAdmin , removeTopic);








//user

// syllabusRouter.get("/syllabus", getSyllabus);   // breaked update !!!
syllabusRouter.get("/get/syllabus/id", getSyllabusByid);




