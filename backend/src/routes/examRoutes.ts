import { Router } from "express";
import {
  CreateNewExamPattern,
  CreateSyllabus,
  findexam,
  getAvalibleExam,
  getCategory,
  getSyllabus,
  getAvalibleExamPattern,
  CreateExam,
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
  getExamAnsForAnalisys,
  getUserAnsSetOfAnExam,
  getExamsbyid,
  getSyllabusByid,
  create_targeted_exam,
  create_targeted_exam_year,
  update_targeted_exam_year,
} from "../controllers/exam.controller";
import { isAdmin } from "../../lib/auth";

export const examRouter = Router();

examRouter.get("/syllabus", getSyllabus);   // breaked update !!!
examRouter.get("/get/syllabus/id", getSyllabusByid);
examRouter.get("/tokensystem", gettokenSystem);



// user
examRouter.get("/category", getCategory);
examRouter.get("/findexam", findexam); // for -> tergeted exam

examRouter.get("/joinrequest", examJoinRequestProcess); // for -> all exam
examRouter.get("/getExams", getExams); // for -> all exam
examRouter.get("/getexambyid", getExamsbyid); // for -> all exam   ----------------------> working
examRouter.get("/data", joinedExamData); // for -> current  exam question data
examRouter.get("/submitans", submitAnswerhandler); // for -> all exam
examRouter.get("/finalsubmit", finalsubmitExam); // close final submit exam

//admin
examRouter.get("/deletexams", isAdmin, deletexams); // for -> tergeted exam
examRouter.get("/avalibleexam", isAdmin, getAvalibleExam); // for -> all exam
examRouter.get("/avalibleExamPattern", isAdmin, getAvalibleExamPattern); // for -> tergeted exam
examRouter.post("/createpattern", isAdmin, CreateNewExamPattern);
examRouter.post("/createsyllabus", isAdmin, CreateSyllabus);
examRouter.post("/create", isAdmin, CreateExam);
examRouter.post("/create/target/exam", isAdmin, create_targeted_exam);
examRouter.post("/create/target/examyear", isAdmin, create_targeted_exam_year);
examRouter.put("/update/target/examyear/info", isAdmin,update_targeted_exam_year);



// end admin


// leader board of an exam
examRouter.get("/usermetadataforanexam", getUserMetaDataforAnExam)
examRouter.get("/examattemptquestiondata", ExamAttemptQuestionMetaData)
examRouter.get("/getexamans", getExamAnsForAnalisys)
examRouter.get("/getuseransset", getUserAnsSetOfAnExam)

// all scorse / over all performance

// performange increase and decrease  graph
