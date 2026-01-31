import { examQuestionAddedCompletionStatusCheck, getExamDetails } from "@/controllers/bot.controller";
import { getExamPatternId, updatExamCrationStatus } from "@/controllers/bot/bot.exampattern.controller";
import { Router } from "express";
export const botExamRouter = Router();




// exam
botExamRouter.get("/patternid/get/:examid", getExamPatternId);
botExamRouter.get("/update/creation/status/:examid", updatExamCrationStatus); // call is to update , no data
botExamRouter.get("/details/get/:examid", getExamDetails);
botExamRouter.get("/question/add/status/:examid", examQuestionAddedCompletionStatusCheck);


