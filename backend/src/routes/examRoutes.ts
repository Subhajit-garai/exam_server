import { Router } from "express";
import {
  getCategory,
  getAvalibleExamPattern,
  // CreateContest,
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
} from "../controllers/exam.controller";
import { isAdmin } from "@repo/lib/security/auth";
import { create_targeted_exam, create_targeted_exam_year, CreateExam, CreateNewExamPattern } from "@/controllers/exam/exam.create.controller";

export const examRouter = Router();

examRouter.get("/tokensystem", gettokenSystem);



// examRouter.get("/findexam", findexam); // for -> tergeted exam
// user
examRouter.get("/category", getCategory);

examRouter.get("/joinrequest", examJoinRequestProcess); // for -> all exam
examRouter.get("/getExams", getExams); // for -> all exam
examRouter.get("/getexambyid", getExamsbyid); // for -> all exam   ----------------------> working
examRouter.get("/data", joinedExamData); // for -> current  exam question data
examRouter.get("/submitans", submitAnswerhandler); // for -> all exam
examRouter.get("/finalsubmit", finalsubmitExam); // close final submit exam
examRouter.get("/year/get", getExamYearInfo); // close final submit exam

//admin
examRouter.get("/deletexams", isAdmin, deletexams); // for -> tergeted exam
examRouter.get("/avalible/targeted/exam", isAdmin, getAvalibletargetExam); // for -> all exam
examRouter.get("/avalible/targeted/exam/all", isAdmin, getAvalibletargetExamAll); // for -> all exam
examRouter.get("/avalibleExamPattern", isAdmin, getAvalibleExamPattern); // for -> tergeted exam
examRouter.post("/createpattern", isAdmin, CreateNewExamPattern);

examRouter.post("/create", isAdmin, CreateExam);

examRouter.post("/get/target/exam/id", isAdmin, fetch_targeted_exam_by_id);
examRouter.post("/create/target/exam", isAdmin, create_targeted_exam);
examRouter.post("/create/target/examyear", isAdmin, create_targeted_exam_year);
examRouter.put("/update/target/examyear/info", isAdmin,update_targeted_exam_year);



// end admin


// leader board of an exam
examRouter.get("/usermetadataforanexam", getUserMetaDataforAnExam)
examRouter.get("/examattemptquestiondata", ExamAttemptQuestionMetaData)
examRouter.get("/getuseransset", getUserAnsSetOfAnExam)

// all scorse / over all performance

// performange increase and decrease  graph
