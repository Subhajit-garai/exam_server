import { Router } from "express";
// import { SelectQuestion } from "../controllers/question.controller";
import { botauthenticate } from "../middleware/botauth";
import { sentQuizData, getQuizTopic ,bot_login,IsprimeUser ,AllUserData,sendGroupinfo,
   isGroupJoinable,sendValidchatids,sendAlluser ,processNotification,
   getexamAnsseet,
   addQuestions,
   getQuestions,
   getQuestionsIds,
   getExamDetails,
   getExamPatternid,
   getExamPattern,
   getUserans,
   SetUserans,
   getExamAns,
   setUserScore,
   getUserScore,
   setUserProgress,
   getMockSetExamPattern,
   getQuestionViaIds,
   getQuestionsByids} from "../controllers/bot.controller";
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
botRouter.get("/exam/patternid/get/:examid", botauthenticate, getExamPatternid);
botRouter.get("/exampattern/get/:exampatternid", botauthenticate, getExamPattern);
botRouter.get("/exam/details/get/:examid", botauthenticate, getExamDetails);
botRouter.get("/mock/exampattern/details/get", botauthenticate, getMockSetExamPattern);

//questions
botRouter.get("/questions/info/get", botauthenticate, getQuestionViaIds);
botRouter.get("/questions/ans/get/:examid", botauthenticate, getExamAns);
botRouter.get("/questions/ids", botauthenticate, getQuestionsIds);
botRouter.get("/questions/get", botauthenticate, getQuestions);
botRouter.post("/questions/get/byids", botauthenticate, getQuestionsByids);
botRouter.post("/questions/add/:examid", botauthenticate, addQuestions);
botRouter.get("/ansseet/get/:examid", botauthenticate, getexamAnsseet); // --- >  removed 


//quiz
botRouter.get("/getquiztopic", botauthenticate, getQuizTopic);
botRouter.post("/getquestionsset", botauthenticate,sentQuizData);  //  auto / daily quiz set

botRouter.get("/isprimeuser", botauthenticate,IsprimeUser)
botRouter.get("/allusers", botauthenticate,sendAlluser) // -- > can be remove 

// telegram group
botRouter.get("/groupinfo", botauthenticate,sendGroupinfo)
botRouter.get("/validchatids", botauthenticate,sendValidchatids)
botRouter.get("/isgroupjoinable", botauthenticate,isGroupJoinable)

botRouter.get("/getusersdata", botauthenticate,AllUserData)

botRouter.post("/notification", botauthenticate,processNotification)

botRouter.post("/login", bot_login);

