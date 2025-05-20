
import {Router} from 'express'
import { Create_Mock_question_set, createQuestion, getAllQuestions, getQuestion, getQuestionalldatabyID, GetQuestionExplanation, QuestionProssingDataFetch, updateQuestion } from "../controllers/question.controller"
import { isAdmin } from '../../lib/auth'


export const questionRouter = Router()


questionRouter.post('/admin/create',isAdmin,createQuestion)

questionRouter.get("/getquestionexplanation" ,GetQuestionExplanation)
questionRouter.get("/:id" ,isAdmin,getQuestion)
questionRouter.get("/alldata/:id" ,isAdmin,getQuestionalldatabyID)
questionRouter.get("/admin/allquestions" ,isAdmin,getAllQuestions)
// new in development
questionRouter.post("/admin/prossing" ,isAdmin,QuestionProssingDataFetch)
questionRouter.put("/admin/update" ,isAdmin,updateQuestion)
questionRouter.post("/admin/mockset/create" ,isAdmin,Create_Mock_question_set)

// edit question 
// delete question
// get a single question
// select exam questions
