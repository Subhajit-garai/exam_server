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
} from "../../controllers/exam.controller.js";
import { getAvailableTargetExam, getAvailableTargetExamAll } from "@/controllers/targetexam.controller.js";
import { getExamYearInfo } from "@/controllers/targetexamyear.controller.js";

export const examPublicRouter = Router();

// Public Routes

examPublicRouter.get("/category/name", getCategoryName);
examPublicRouter.get("/join", examJoinRequestProcess);
examPublicRouter.get("/all", getExams);
examPublicRouter.get("/id", getExamsById);
examPublicRouter.get("/data", getJoinedExamData);
examPublicRouter.get("/submit/ans", submitAnswerHandler);
examPublicRouter.get("/submit/final", finalSubmitExam);
examPublicRouter.get("/year/get", getExamYearInfo);
examPublicRouter.get("/metadata/user", getUserMetaDataForExam)
examPublicRouter.get("/attempt/data", getExamAttemptQuestionMetaData)
examPublicRouter.get("/ansset", getUserAnsSetOfAnExam)
examPublicRouter.get("/available/targeted/exam", getAvailableTargetExam);
examPublicRouter.get("/available/targeted/exam/all", getAvailableTargetExamAll);
