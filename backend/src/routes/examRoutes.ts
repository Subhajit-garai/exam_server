import { Router } from "express";
import {
  deletexams,
  getExams,
  examJoinRequestProcess,
  joinedExamData,
  submitAnswerhandler,
  gettokenSystem,
  finalsubmitExam,
  getUserMetaDataforAnExam,
  ExamAttemptQuestionMetaData,
  getUserAnsSetOfAnExam,
  getExamsbyid,
  update_targeted_exam_year,
  getAvalibletargetExam,
  getAvalibletargetExamAll,
  getExamYearInfo,
  fetch_targeted_exam_by_id,
  getCategoryName,
} from "../controllers/exam.controller.js";
import { create_targeted_exam, create_targeted_exam_year, CreateExam } from "@/controllers/exam/exam.create.controller.js";


export const examAdminRouter = Router();
export const examPublicRouter = Router();

// Public Routes
examPublicRouter.get("/tokensystem", gettokenSystem);
examPublicRouter.get("/category/name", getCategoryName);
examPublicRouter.get("/joinrequest", examJoinRequestProcess);
examPublicRouter.get("/getExams", getExams);
examPublicRouter.get("/getexambyid", getExamsbyid);
examPublicRouter.get("/data", joinedExamData);
examPublicRouter.get("/submitans", submitAnswerhandler);
examPublicRouter.get("/finalsubmit", finalsubmitExam);
examPublicRouter.get("/year/get", getExamYearInfo);
examPublicRouter.get("/usermetadataforanexam", getUserMetaDataforAnExam)
examPublicRouter.get("/examattemptquestiondata", ExamAttemptQuestionMetaData)
examPublicRouter.get("/getuseransset", getUserAnsSetOfAnExam)
examPublicRouter.get("/avalible/targeted/exam", getAvalibletargetExam);
examPublicRouter.get("/avalible/targeted/exam/all", getAvalibletargetExamAll);

// Admin Routes (Protected)
examAdminRouter.post("/get/target/exam/id", fetch_targeted_exam_by_id);

examAdminRouter.get("/deletexams", deletexams);
examAdminRouter.post("/create", CreateExam);
examAdminRouter.post("/create/target/exam", create_targeted_exam);
examAdminRouter.post("/create/target/examyear", create_targeted_exam_year);
examAdminRouter.put("/update/target/examyear/info", update_targeted_exam_year);
