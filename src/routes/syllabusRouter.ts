import { Router } from "express";
import {
    getSyllabusByid,
    formatedSyllabus,
    getDetaildformatedSyllabus
} from "@/controllers/syllabus.controller.js";

export const syllabusPublicRouter = Router();

// Public Routes
syllabusPublicRouter.get("/get/formated", formatedSyllabus)
syllabusPublicRouter.get("/get/detailed/formated", getDetaildformatedSyllabus)
syllabusPublicRouter.get("/get/syllabus/id", getSyllabusByid);





