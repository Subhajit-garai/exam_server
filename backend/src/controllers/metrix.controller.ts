import prisma from "../../db";
import { timeinpute } from "../zod/metrix.zod";
import dayjs from "dayjs";

import {
  get_subject_wish_daily_score,
  get_subject_wish_hour_score,
  get_subject_wish_minute_score,
  get_subject_wish_monthly_score,
  get_subject_wish_weekly_score,
  getdailyscore,
  gethourscore,
  getminutescore,
  getmonthlyscore,
  getweeklyscore,
  top_4_user_from_exam_leaderboard,
  top_10_user_from_exam_leaderboard,
} from "@prisma/client/sql";

export const test = async (req: any, res: any) => {
  try {
    res.json({ success: true, message: "message", data: "data" });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const examQuestionAttemp = async (req: any, res: any) => {
  try {
      let data = await prisma.score.findFirst({
        where:{
          user_id: req.user,
          exam_id: req.query.examid
        },
        select:{
          not_attempt:true
          // add total question 
        },
      })


      if(!data){
        return res.status(404).json({
          success: false,
          message: "user's data not found in score"
        })
      }
      
    res.json({ success: true, message: "message", data: data });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};



export const getDiffFromTopRanker = async (req: any, res: any) => {
  try {
    let userid = req.user as string;
    let examid = req.query.examid as string; // exam or contest or quiz

    res.json({ success: true, message: "message", data: "data" });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};
// tested
export const WeekNessGraphOfAnExam = async (req: any, res: any) => {
  try {
    let range = 10;
    let examid = req.query.examid as string;
    let userid = req.user;

    if(!examid || !userid) return;
    
    let data = await prisma.score.findFirst({
      where: {
        user_id: userid,
        exam_id: examid,
      },
      select: {
        topic_wise_result: true,
      },
    });

    type item = {
      [key:string]:{
        Right: number,
        Wrong: number,
      }
    
    }


    let sanitizedFn = (items:item) => {
      if(!items) return
      let arr:any[] = [];
      Object.keys(items).forEach(item => {

        let eleA = items[item].Right;
        let eleB = items[item].Wrong;
        if (eleA > range || eleB > range) {
          range = range + 10;
        }
        arr.push( {
          subject: item as string,
          A: eleA,
          B: eleB,
          fullMark: eleA + eleB,
        })
      })      
      return arr;
    }    
    let sanitizedData = sanitizedFn(data?.topic_wise_result as item)
    res.json({ success: true, message: "message", data: sanitizedData ,range: range });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const getUserALLExamsRankData = async (req: any, res: any) => {
  try {
    let offset = req.param.offset ? req.param.offset : 10;
    let userid = req.user as string;
    let data = await prisma.leaderboard.findMany({
      where: {
        user_id: userid,
      },
      orderBy: {
        updated_at: "desc",
      },
      select: {
        exam_id: true,
        score: true,
        rank: true,
      },
      take: offset,
    });
    res.json({ success: true, message: "message", data: data });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const getTopNOfAnExam = async (req: any, res: any) => {
  try {
    let examid = req.query.examid as string; // exam or contest or quiz
    let offset = req.query.offset ? req.query.offset : 4;
    let userid = req.user as string;
    let data:
      | top_10_user_from_exam_leaderboard.Result[]
      | top_4_user_from_exam_leaderboard.Result[] = [];

    switch (offset) {
      case "10":
        data = await prisma.$queryRawTyped(
          top_10_user_from_exam_leaderboard(examid, userid)
        );
        break;
      default:
        data = await prisma.$queryRawTyped(
          top_4_user_from_exam_leaderboard(examid, userid)
        );
        break;
    }

    if (!data) {
    }
    res.json({ success: true, message: "message", data: data });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const getAllUserRankFronAnExam = async (req: any, res: any) => {
  try {
    let examid = req.query.examid as string; // exam or contest or quiz
    let userid = req.user as string;
    let data = await prisma.leaderboard.findMany({
      where: {
        exam_id: examid,
        user_id: { not: userid },
      },
      select: {
        score: true,
        rank: true,
      },
    });
    let myRank = await prisma.leaderboard.findFirst({
      where: {
        exam_id: examid,
        user_id: userid,
      },
      select: {
        score: true,
        rank: true,
      },
    });

    res.json({ success: true, message: "message", data: data, myRank: myRank });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const getExamRank = async (req: any, res: any) => {
  try {
    let examid = req.query.examid as string; // exam or contest or quiz

    let Rank = await prisma.leaderboard.findFirst({
      where: {
        exam_id: examid,
        user_id: req.user,
      },
      select: {
        score: true,
        rank: true,
      },
    });

    res.json({ success: true, message: "message", data: Rank });
  } catch (error) {
    console.log("Error in metrix getExamRank --->", error);
  }
};

export const getperformance = async (req: any, res: any) => {
  try {
    let userid = req.user;

    let data = await prisma.progress.findFirst({
      where: {
        userid: userid,
      },
    });



    res.json({ success: true, message: "message", data: data });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const getScoreMetrix = async (req: any, res: any) => {
  try {
    let userid = req.user;
    let offset = req.query.offset;
    let startDate = req.query.startDate;
    let endDate = req.query.endDate;
    let interval = "7 DAYS";
    let data:
      | getdailyscore.Result[]
      | getweeklyscore.Result[]
      | getmonthlyscore.Result[]
      | gethourscore.Result[]
      | getminutescore.Result[] = [];

    if (
      !offset ||
      !["week", "month", "day", "hour", "minute"].includes(offset)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid offset value" });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required for range filtering",
      });
    } else {
      startDate = parseInt(startDate);
      endDate = parseInt(endDate);
      if (
        !(
          timeinpute.safeParse(startDate).success &&
          timeinpute.safeParse(endDate).success
        )
      ) {
      }
      // console.log(timeinpute.safeParse(startDate));
    }

    if (offset) {
      switch (offset) {
        case "week":
          data = await prisma.$queryRawTyped(getweeklyscore(userid, interval));
          break;
        case "month":
          data = await prisma.$queryRawTyped(getmonthlyscore(userid, interval));
          break;
        case "hour":
          data = await prisma.$queryRawTyped(gethourscore(userid, interval));
          break;
        case "minute":
          data = await prisma.$queryRawTyped(getminutescore(userid, interval));
          break;
        default:
          data = await prisma.$queryRawTyped(getdailyscore(userid, interval)); // day
          break;
      }
    }

    const sanitizedData = data.map((item: any) => {
      return {
        ...item,
        total_score: parseInt(item.total_score),
      };
    });

    const maxScore = sanitizedData.reduce(
      (max, item) => Math.max(max, item.total_score),
      -Infinity
    );

    let finaldata = sanitizedData.map((item: any) => {
      let time = dayjs(item[offset]);
      let key = time.format("DD-MMM-YYYY");
      switch (offset) {
        case "week":
          key = time.format("DD-MMM"); // day-month:weekno
          break;
        case "month":
          key = time.format("MMM-YY"); // day-month-year
          break;
        case "hour":
          key = time.format("ddd-MMM:hh A"); // day-month:hour:minute
          break;
        case "minute":
          key = time.format("ddd:hh:mm A"); // day-month:hour:minute
          break;
        default:
          break;
      }

      return {
        key: key,
        score: item.total_score,
      };
    });

    res.json({
      success: true,
      message: "message",
      data: finaldata,
      range: maxScore,
    });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const getSubjectScoreMetrix = async (req: any, res: any) => {
  try {
    let userid = req.user;
    let offset = req.query.offset;
    let startDate = req.query.startDate;
    let endDate = req.query.endDate;
    let interval = "7 DAYS";

    let data:
      | get_subject_wish_weekly_score.Result[]
      | get_subject_wish_daily_score.Result[]
      | get_subject_wish_monthly_score.Result[]
      | get_subject_wish_hour_score.Result[]
      | get_subject_wish_minute_score.Result[] = [];

    if (
      !offset ||
      !["week", "month", "day", "hour", "minute"].includes(offset)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid offset value" });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required for range filtering",
      });
    }

    if (offset) {
      switch (offset) {
        case "week":
          data = await prisma.$queryRawTyped(
            get_subject_wish_weekly_score(userid, interval)
          );
          break;
        case "month":
          data = await prisma.$queryRawTyped(
            get_subject_wish_monthly_score(userid, interval)
          );
          break;
        case "hour":
          data = await prisma.$queryRawTyped(
            get_subject_wish_hour_score(userid, interval)
          );
          break;
        case "minute":
          data = await prisma.$queryRawTyped(
            get_subject_wish_minute_score(userid, interval)
          );
          break;
        default:
          data = await prisma.$queryRawTyped(
            get_subject_wish_daily_score(userid, interval)
          ); // day
          break;
      }
    }
    let range = 10;

    interface Data {
      subject: string;
      A: number;
      B: number;
      fullMark: number;
    }

    const avgBySubject = (data: Data[]): Data[] => {
      const grouped = data.reduce((acc, item) => {
        if (!acc[item.subject]) {
          acc[item.subject] = { ...item, count: 1 };
        } else {
          acc[item.subject].A += item.A;
          acc[item.subject].B += item.B;
          acc[item.subject].count += 1;
        }
        return acc;
      }, {} as { [key: string]: Data & { count: number } });

      const result = Object.keys(grouped).map((subject) => {
        const item = grouped[subject];
        return {
          subject: item.subject,
          A: item.A / item.count,
          B: item.B / item.count,
          fullMark: item.fullMark,
        };
      });

      return result;
    };

    let sanitizedData = data.map((item: any) => {
      let eleA = parseInt(item.total_right);
      let eleB = parseInt(item.total_wrong);
      if (eleA > range || eleB > range) {
        range = range + 10;
      }
      return {
        subject: item.subject as string,
        A: eleA,
        B: eleB,
        fullMark: eleA + eleB,
      };
    });

    const finaldata = avgBySubject(sanitizedData);

    res.json({
      success: true,
      message: "message",
      data: finaldata,
      range: range,
    });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};
