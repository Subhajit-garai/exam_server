import { Router } from "express";
import {
  getScoreMetrix,
  getSubjectScoreMetrix , test,getperformance,
  getUserALLExamsRankData,
  getTopNOfAnExam,
  getAllUserRankFronAnExam,
  getExamRank,
  WeekNessGraphOfAnExam,
  examQuestionAttemp,
} from "../controllers/metrix.controller";

export const metrixRoute = Router();

metrixRoute.get("/test", test);

metrixRoute.get("/getscore", getScoreMetrix);
metrixRoute.get("/getsubjectwisescore", getSubjectScoreMetrix);
metrixRoute.get("/performance", getperformance);

// leaderboard
metrixRoute.get("/examweeknessmetrix",WeekNessGraphOfAnExam );
metrixRoute.get("/myranks",getUserALLExamsRankData );
metrixRoute.get("/myrank",getExamRank);
metrixRoute.get("/allranks",getAllUserRankFronAnExam );
metrixRoute.get("/leaderbord", getTopNOfAnExam);
metrixRoute.get("/fullleaderbord", getTopNOfAnExam);
metrixRoute.get("/examquestionattemp", examQuestionAttemp);
