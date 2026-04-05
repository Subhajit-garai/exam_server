import { Router } from "express";
import {
  //   deletexams,
  getExams,
  examJoinRequestProcess,
  getJoinedExamData,
  submitAnswerHandler,
  getTokenSystem,
  finalSubmitExam,
  getUserMetaDataForExam,
  getExamAttemptQuestionMetaData,
  getUserAnsSetOfAnExam,
  getExamsById,
  getCategoryName,
  CreateExam,
  refreshExam,
} from "../controllers/exam.controller.js";
import { create_targeted_exam, fetchTargetedExamById, getAvailableTargetExam, getAvailableTargetExamAll } from "@/controllers/targetexam.controller.js";
import { create_targeted_exam_year, getExamYearInfo, updateTargetedExamYear } from "@/controllers/targetexamyear.controller.js";


export const examAdminRouter = Router();
export const examPublicRouter = Router();

// Public Routes

examPublicRouter.get("/tokensystem", getTokenSystem);
examPublicRouter.get("/category/name", getCategoryName);
examPublicRouter.get("/joinrequest", examJoinRequestProcess);
examPublicRouter.get("/getExams", getExams);
examPublicRouter.get("/getexambyid", getExamsById);
examPublicRouter.get("/data", getJoinedExamData);
examPublicRouter.get("/submitans", submitAnswerHandler);
examPublicRouter.get("/finalsubmit", finalSubmitExam);
examPublicRouter.get("/year/get", getExamYearInfo);
examPublicRouter.get("/usermetadataforanexam", getUserMetaDataForExam)
examPublicRouter.get("/examattemptquestiondata", getExamAttemptQuestionMetaData)
examPublicRouter.get("/getuseransset", getUserAnsSetOfAnExam)
examPublicRouter.get("/avalible/targeted/exam", getAvailableTargetExam);
examPublicRouter.get("/avalible/targeted/exam/all", getAvailableTargetExamAll);

// Admin Routes (Protected)
examAdminRouter.post("/get/target/exam/id", fetchTargetedExamById);

// examAdminRouter.get("/deletexams", deletexams);
examAdminRouter.post("/create", CreateExam);
examAdminRouter.post("/create/target/exam", create_targeted_exam);
examAdminRouter.post("/create/target/examyear", create_targeted_exam_year);
examAdminRouter.put("/update/target/examyear/info", updateTargetedExamYear);
examAdminRouter.post("/refresh/:examid", refreshExam);
