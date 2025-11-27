import { Router } from "express";
// import { SelectQuestion } from "../controllers/question.controller";
import { botauthenticate } from "../middleware/botauth.js";
import { examQuestionAddedCompletionStatusCheck, getExamDetails, getQuestionViaIds, getSyllabusDataForExamCreattion, processNotification, setUserProgress } from "@/controllers/bot.controller.js";
import { getUserScore, setUserScore } from "@/controllers/bot/bot.score.controller.js";
import { getExamAns, getUserans, SetUserans } from "@/controllers/bot/bot.ans.controller.js";
import { getExamPattern, getExamPatternId, getMockSetExamPattern, updatExamCrationStatus } from "@/controllers/bot/bot.exampattern.controller.js";
import { addQuestions, getQuestions, getQuestionsByids, getQuestionsIds } from "@/controllers/bot/bot.question.controller.js";
import { getQuizConfigdData, getQuizTopic, sentQuizData } from "@/controllers/bot/bot.quiz.controller.js";
import { AllUserData, bot_login, isGroupJoinable, IsprimeUser, sendAlluser, sendGroupinfo, sendGroupTopicinfo, sendValidchatids } from "@/controllers/bot/bot.telegram.controller.js";
export const botRouter = Router();

botRouter.get("/auth", botauthenticate, (req, res) => {
  res.json({ success: true, message: "bot validate successfully" });
});




// user
botRouter.post("/user/progress/set", botauthenticate, setUserProgress);
botRouter.post("/user/score/set", botauthenticate, setUserScore);
botRouter.get("/user/score/get", botauthenticate, getUserScore);
botRouter.post("/user/ans/set", botauthenticate, SetUserans);
botRouter.get("/user/ans/get", botauthenticate, getUserans);

// exam
botRouter.get("/exam/patternid/get/:examid", botauthenticate, getExamPatternId);
botRouter.get("/exam/update/creation/status/:examid", botauthenticate, updatExamCrationStatus); // call is to update , no data

botRouter.get("/exampattern/get/:exampatternid", botauthenticate, getExamPattern);
botRouter.get("/exam/details/get/:examid", botauthenticate, getExamDetails);
botRouter.get("/mock/exampattern/details/get", botauthenticate, getMockSetExamPattern);
botRouter.get("/exam/questions/add/status/:examid", botauthenticate, examQuestionAddedCompletionStatusCheck);

//syllabus
botRouter.get("/syllabus/exam/get", botauthenticate, getSyllabusDataForExamCreattion);



//questions
botRouter.get("/questions/info/get", botauthenticate, getQuestionViaIds);
botRouter.get("/questions/ans/get/:examid", botauthenticate, getExamAns);
botRouter.get("/questions/ids", botauthenticate, getQuestionsIds);
botRouter.get("/questions/get", botauthenticate, getQuestions);
botRouter.post("/questions/get/byids", botauthenticate, getQuestionsByids);
botRouter.post("/questions/add/:examid", botauthenticate, addQuestions);


//quiz
botRouter.get("/getquiztopic", botauthenticate, getQuizTopic);
botRouter.get("/get/quiz/config", botauthenticate, getQuizConfigdData);
botRouter.post("/getquestionsset", botauthenticate, sentQuizData);  //  auto / daily quiz set
botRouter.get("/isprimeuser", botauthenticate, IsprimeUser)
botRouter.get("/allusers", botauthenticate, sendAlluser) // -- > can be remove 

// telegram group
botRouter.get("/group/info", botauthenticate, sendGroupinfo)
botRouter.get("/group/topic/info/get", botauthenticate, sendGroupTopicinfo)
botRouter.get("/validchatids", botauthenticate, sendValidchatids)
botRouter.get("/isgroupjoinable", botauthenticate, isGroupJoinable)
botRouter.get("/getusersdata", botauthenticate, AllUserData)
botRouter.post("/notification", botauthenticate, processNotification)
botRouter.post("/login", bot_login);

