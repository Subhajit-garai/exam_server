import { Router } from "express";
import { AddProcessingQuestions, examQuestionAddedCompletionStatusCheck, getExamDetails, getQuestionViaIds, getQuestionViaIdsforProcessing, getSyllabusDataForExamCreattion, getUserdata, processNotification, setUserProgress } from "@/controllers/bot.controller.js";
import { getUserScore, setUserScore } from "@/controllers/bot/bot.score.controller.js";
import { getExamAns, getUserans, SetUserans } from "@/controllers/bot/bot.ans.controller.js";
import { getExamPattern, getExamPatternId, getMockSetExamPattern, updatExamCrationStatus } from "@/controllers/bot/bot.exampattern.controller.js";
import { addQuestions, getQuestions, getQuestionsByids, getQuestionsIds } from "@/controllers/bot/bot.question.controller.js";
import { getQuizConfigdData, getQuizTopic, sentQuizData } from "@/controllers/bot/bot.quiz.controller.js";
import { AllUserData, bot_login, isGroupJoinable, IsprimeUser, sendAlluser, sendGroupinfo, sendGroupTopicinfo, sendValidchatids } from "@/controllers/bot/bot.telegram.controller.js";
import { botauthenticate } from "@/middleware/botauth.js";

export const botRouter = Router();
export const botSecureRouter = Router();

botRouter.get("/auth", (req, res) => {
  res.json({ success: true, message: "bot validate successfully" });
});

botRouter.post("/login", bot_login);

botRouter.use("/", botauthenticate, botSecureRouter);
// user
botSecureRouter.get("/user/info/:id", getUserdata);
botSecureRouter.post("/user/progress/set", setUserProgress);
botSecureRouter.post("/user/score/set", setUserScore);
botSecureRouter.get("/user/score/get", getUserScore);
botSecureRouter.post("/user/ans/set", SetUserans);
botSecureRouter.get("/user/ans/get", getUserans);

// exam
botSecureRouter.get("/exam/patternid/get/:examid", getExamPatternId);
botSecureRouter.get("/exam/update/creation/status/:examid", updatExamCrationStatus); // call is to update , no data
botSecureRouter.get("/exampattern/get/:exampatternid", getExamPattern);
botSecureRouter.get("/exam/details/get/:examid", getExamDetails);
botSecureRouter.get("/mock/exampattern/details/get", getMockSetExamPattern);
botSecureRouter.get("/exam/questions/add/status/:examid", examQuestionAddedCompletionStatusCheck);

//syllabus
botSecureRouter.get("/syllabus/exam/get", getSyllabusDataForExamCreattion);



//questions
botSecureRouter.post("/question/processing/get/simple", getQuestionViaIdsforProcessing); //remove 
botSecureRouter.post("/question/processing/get", getQuestionViaIdsforProcessing);
botSecureRouter.post("/question/processed/add", AddProcessingQuestions);
botSecureRouter.get("/questions/info/get", getQuestionViaIds);
botSecureRouter.get("/questions/ans/get/:examid", getExamAns);
botSecureRouter.get("/questions/ids", getQuestionsIds);
botSecureRouter.get("/questions/get", getQuestions);
botSecureRouter.post("/questions/get/byids", getQuestionsByids);
botSecureRouter.post("/questions/add/:examid", addQuestions);


//quiz
botSecureRouter.get("/getquiztopic", getQuizTopic);
botSecureRouter.get("/get/quiz/config", getQuizConfigdData);
botSecureRouter.post("/getquestionsset", sentQuizData);  //  auto / daily quiz set
botSecureRouter.get("/isprimeuser", IsprimeUser)
botSecureRouter.get("/allusers", sendAlluser) // -- > can be remove 

// telegram group
botSecureRouter.get("/group/info", sendGroupinfo)
botSecureRouter.get("/group/topic/info/get", sendGroupTopicinfo)
botSecureRouter.get("/validchatids", sendValidchatids)
botSecureRouter.get("/isgroupjoinable", isGroupJoinable)
botSecureRouter.get("/getusersdata", AllUserData)
botSecureRouter.post("/notification", processNotification)


// Fallback for unmatched bot routes to prevent falling through to user auth
botRouter.use((req, res) => {
  res.status(404).json({ success: false, message: "Bot route not found" });
});


