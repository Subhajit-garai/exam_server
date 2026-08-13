import { Router } from "express";
import {
  getExams,
  examJoinRequestProcess,
  getJoinedExamData,
  submitAnswerHandler,
  finalSubmitExam,
  getUserMetaDataForExam,
  getExamAttemptQuestionMetaData,
  getUserAnsSetOfAnExam,
  getExamsById,
  getCategoryName,
  getAvailableTargetExam,
  getAvailableTargetExamAll,
  getExamYearInfo,
  CreateExam,
  refreshExam,
  create_targeted_exam,
  fetchTargetedExamById,
  create_targeted_exam_year,
  updateTargetedExamYear,
  getAvailableExamPattern,
  getExamPatternById,
  CreateNewExamPattern,
  updateExamPattern,
  deleteExamPattern,
  getTimelines,
  getAllTimelines,
  createTimeline,
  updateTimeline,
  deleteTimeline,
} from "./controller.js";
import { isAdmin } from "@repo/lib/security/auth.js";

// Public Routers
export const examPublicRouter = Router();
export const examPatternPublicRouter = Router();
export const examTimelinePublicRouter = Router();

// Admin Routers
export const examAdminRouter = Router();
export const examPatternAdminRouter = Router();
export const examTimelineAdminRouter = Router();

// Exam Public Routes
examPublicRouter.get("/category/name", getCategoryName);
examPublicRouter.get("/join", examJoinRequestProcess);
examPublicRouter.get("/all", getExams);
examPublicRouter.get("/id", getExamsById);
examPublicRouter.get("/data", getJoinedExamData);
examPublicRouter.get("/submit/ans", submitAnswerHandler);
examPublicRouter.get("/submit/final", finalSubmitExam);
examPublicRouter.get("/year/get", getExamYearInfo);
examPublicRouter.get("/metadata/user", getUserMetaDataForExam);
examPublicRouter.get("/attempt/data", getExamAttemptQuestionMetaData);
examPublicRouter.get("/ansset", getUserAnsSetOfAnExam);
examPublicRouter.get("/available/targeted/exam", getAvailableTargetExam);
examPublicRouter.get("/available/targeted/exam/all", getAvailableTargetExamAll);

// Exam Admin Routes
examAdminRouter.post("/get/target/exam/id", fetchTargetedExamById);
examAdminRouter.post("/create", CreateExam);
examAdminRouter.post("/create/target/exam", create_targeted_exam);
examAdminRouter.post("/create/target/examyear", create_targeted_exam_year);
examAdminRouter.put("/update/target/examyear/info", updateTargetedExamYear);
examAdminRouter.post("/refresh/:examid", refreshExam);

// Exam Pattern Public Routes
examPatternPublicRouter.get("/available", getAvailableExamPattern);

// Exam Pattern Admin Routes
examPatternAdminRouter.post("/create", isAdmin, CreateNewExamPattern);
examPatternAdminRouter.get("/:id", isAdmin, getExamPatternById);
examPatternAdminRouter.put("/update", isAdmin, updateExamPattern);
examPatternAdminRouter.delete("/delete/:id", isAdmin, deleteExamPattern);

// Exam Timeline Public Routes
examTimelinePublicRouter.get("/", getTimelines);

// Exam Timeline Admin Routes
examTimelineAdminRouter.get("/all", isAdmin, getAllTimelines);
examTimelineAdminRouter.post("/create", isAdmin, createTimeline);
examTimelineAdminRouter.put("/update", isAdmin, updateTimeline);
examTimelineAdminRouter.delete("/delete", isAdmin, deleteTimeline);
