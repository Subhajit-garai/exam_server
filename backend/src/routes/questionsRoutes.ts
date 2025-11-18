import { Router } from "express";
import {
  createQuestion,
  getAllQuestions,
  getQuestion,
  getQuestionalldatabyID,
  GetQuestionExplanation,
  updateQuestion,
} from "../controllers/question.controller";
import { isAdmin } from "@repo/lib/security/auth";


export const questionRouter = Router();



questionRouter.post("/admin/create", isAdmin, createQuestion);

questionRouter.get("/getquestionexplanation", GetQuestionExplanation);
questionRouter.get("/:id", isAdmin, getQuestion);
questionRouter.get("/alldata/:id", isAdmin, getQuestionalldatabyID);
questionRouter.get("/admin/allquestions", isAdmin, getAllQuestions);
// new in development
// questionRouter.post("/admin/prossing" ,isAdmin,QuestionProssingDataFetch)
questionRouter.put("/admin/update", isAdmin, updateQuestion);










// mock set

// questionRouter.post("/admin/mockset/create", isAdmin, Create_Mock_question_set);
// questionRouter.get("/admin/mockset/getall", isAdmin, get_all_mock_question_set);
// questionRouter.get("/admin/mockset/get", isAdmin, get_mock_question_set_by_id);
// questionRouter.get("/admin/mockset/get/questions", isAdmin, get_mock_set_questions);
// questionRouter.get(
//   "/admin/mockset/topics",
//   isAdmin,
//   getSyllabusByMockQuestionSetid
// );
// questionRouter.get(
//   "/admin/mockset/question/add",
//   isAdmin,
//   AddQuestionIntoMockQuestionSet
// );
// questionRouter.get(
//   "/admin/mockset/question/remove",
//   isAdmin,
//   RemoveQuestionFromMockQuestionSet
// );
// questionRouter.get("/admin/mockset/getids", isAdmin, getAvalibleMockSets);
