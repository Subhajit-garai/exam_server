
import {Router} from 'express'
import { createQuestion, getAllQuestions, getQuestion, getQuestionalldata, GetQuestionExplanation, QuestionProssingDataFetch } from "../controllers/question.controller"
import { isAdmin } from '../../lib/auth'


export const questionRouter = Router()


questionRouter.post('/admin/create',isAdmin,createQuestion)

questionRouter.get("/getquestionexplanation" ,GetQuestionExplanation)
questionRouter.get("/:id" ,isAdmin,getQuestion)
questionRouter.get("/alldata/:id" ,isAdmin,getQuestionalldata)
questionRouter.get("/admin/allquestions" ,isAdmin,getAllQuestions)
// new in development
questionRouter.post("/admin/prossing" ,isAdmin,QuestionProssingDataFetch)

// edit question 
// delete question
// get a single question
// select exam questions
