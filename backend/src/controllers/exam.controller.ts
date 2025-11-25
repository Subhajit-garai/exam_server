import {
  Visibility,
} from "@repo/prisma/client";
import prisma from "@repo/db/index";

import { examManager } from "@repo/lib/manager/examManager";
import { ExamMetaData } from "@repo/lib/types";
import { SubmitedQuestionAnsZodSchema } from "../zod/question.zod";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { getServiceCharge, TokenDeduction } from "@repo/lib/helper/payment";
import { asyncHandler } from "@repo/lib/helper/asyncHandler";
import {
  updare_targated_exam_year_zodSchemea,
} from "../zod/exam.zod";
import { ZodDataSafeParse } from "@repo/lib/ZodTypeChecker";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const em = examManager.getInstance();

export const test = asyncHandler(async (req: any, res: any) => {
  res.json({
    success: true,
    message: " created successfuly",
    data: "data",
  });
});

// in dev
export const deletexams = async (req: any, res: any) => {
  try {
    let response = await prisma.exam.deleteMany({});

    res.json({
      success: true,
      message: `  Exam  removed`,
      for: response,
    });
  } catch (error) {
    console.log("Error in exam controller", error);
  }
};

// done

export const update_targeted_exam_year = asyncHandler(
  async (req: any, res: any) => {
    let processedData = updare_targated_exam_year_zodSchemea.safeParse(
      req.body
    );

    if (!processedData.success) {
      throw ZodDataSafeParse(processedData);
    }

    let isTargetdExam_Year = await prisma.examYear.findUnique({
      where: {
        id: processedData.data.exam_year_id,
      },
    });

    if (!isTargetdExam_Year) {
      throw new Error("Porvided exam year id is invalid ");
    }

    let updated_target_exam_year = await prisma.examYear.update({
      where: {
        id: processedData.data?.exam_year_id,
      },
      data: {
        ...(processedData.data.category
          ? { category: processedData.data.category }
          : undefined),
        ...(processedData.data.registrationOpenDate
          ? { registrationOpenDate: processedData.data.registrationOpenDate }
          : undefined),
        ...(processedData.data.registrationCloseDate
          ? { registrationCloseDate: processedData.data.registrationCloseDate }
          : undefined),
        ...(processedData.data.registrationOpenDate
          ? { registrationOpenDate: processedData.data.registrationOpenDate }
          : undefined),
        ...(processedData.data.registrationCloseDate
          ? { registrationCloseDate: processedData.data.registrationCloseDate }
          : undefined),
        ...(processedData.data.notes
          ? { notes: processedData.data.notes }
          : undefined),
        ...(processedData.data.status
          ? { status: processedData.data.status }
          : undefined),
        ...(processedData.data.slug
          ? { slug: processedData.data.slug }
          : undefined),
      },
    });

    if (!updated_target_exam_year) {
      throw new Error("updated_target_exam_year not  updated  ");
    }

    res.json({
      success: true,
      message: "  updated_target_exam_year successfuly",
      data: updated_target_exam_year,
    });
  }
);

export const getUserAnsSetOfAnExam = async (req: any, res: any) => {
  try {
    let examid = req.query.examid;
    let userid = req.user;

    let data = await prisma.userAns.findMany({
      where: {
        userId: userid,
        examId: examid,
      },
      select: {
        selectedOption: true,
        shuffleMap: true,
        part: true,
        number: true,

        Question: {
          select: {
            id: true,
            options: true,
            title: true,
            ans: true,
            extra: true,
            format: true,
            is_multiple_ans: true,
            explanation: true,
            Subject: {
              select: {
                name: true,
                shortName: true,
              },
            },
            Topic: {
              select: {
                name: true,
                shortName: true,
              },
            },
          },
        },
      },
      // orderBy:
    });

    res.json({ success: true, message: "message", data: data });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const getUserMetaDataforAnExam = async (req: any, res: any) => {
  try {
    let examid = req.query.examid;
    let userid = req.user;
    let data: ExamMetaData = {} as ExamMetaData;

    let userScore = await prisma.score.findFirst({
      where: {
        user_id: userid,
        exam_id: examid,
      },
      select: {
        score: true,
        result: true,
      },
    });
    let userLeaderboard = await prisma.leaderboard.findFirst({
      where: {
        user_id: userid,
        exam_id: examid,
      },
      select: {
        rank: true,
      },
    });
    let topper = await prisma.leaderboard.findFirst({
      where: {
        exam_id: examid,
        rank: 1,
      },
      select: {
        user_id: true,
        score: true,
      },
    });

    function userTotalRightWrong(userScore: any) {
      if (!userScore?.result) {
        return { rignt: 0, wrong: 0 };
      }
      let rignt = 0;
      let wrong = 0;
      if (userScore?.result) {
        Object.keys(userScore.result).forEach((item: any) => {
          //  console.log("item",item);
          //  console.log("item data",userScore.result[item].Right);
          rignt += userScore.result[item].Right;
          wrong += userScore.result[item].Wrong;
        });
      }
      return { rignt, wrong };
    }

    let { rignt, wrong } = userTotalRightWrong(userScore);
    data.examid = examid;
    data.score = userScore ? userScore?.score : 0;
    data.rignt = rignt;
    data.wrong = wrong;
    data.attempts = 1;
    data.rank = userLeaderboard ? userLeaderboard?.rank : 0;
    data.inTop10 = userLeaderboard ? userLeaderboard?.rank : 0; // false;
    data.topperScore = topper ? topper?.score : 0;

    res.json({ success: true, message: "message", data: data });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

// working here

//1.0
export const gettokenSystem = async (req: any, res: any) => {
  try {
    let data;
    let type = req.query.type;
    data = await getServiceCharge(undefined, type, req.user);

    res.json({
      success: true,
      message: `tokenSystem for exam `,
      data: data,
    });
  } catch (error) {
    console.log("error -> ", error);

    return res.status(400).json({
      success: false,
      message: `tokenSystem not created`,
    });
  }
};

// checked 2.0
export const getCategory = asyncHandler(async (req: any, res: any) => {
  let response = await prisma.targetExam.findMany({
    distinct: ["category"],
    select: {
      category: true,
    },
  });

  if (!response) {
    return res
      .status(400)
      .json({ success: false, message: `Can not find any Category` });
  }
  let Category = response.flat().map((item) => item.category);

  res.json({
    success: true,
    message: ` available Categorys `,
    data: Category,
  });
});

export const fetch_targeted_exam_by_id = asyncHandler(
  async (req: any, res: any) => {
    let { id } = req.query;
    let target_exam = await prisma.targetExam.findFirst({
      where: {
        id: id,
      },
    });

    if (!target_exam) throw Error("Target exam not found");
    return res.json({
      success: true,
      message: "targated_exam created successfuly",
      data: target_exam.name,
    });
  }
);

export const ExamAttemptQuestionMetaData = asyncHandler(
  async (req: any, res: any) => {
    let examid = req.query.examid;
    let userid = req.user;
    let data = await prisma.score.findFirst({
      where: {
        user_id: userid,
        exam_id: examid,
      },
      select: {
        not_attempt: true,
        total_questions: true,
      },
    });
    res.json({ success: true, message: "message", data: data });
  }
);

export const submitAnswerhandler = asyncHandler(async (req: any, res: any) => {
  let data = SubmitedQuestionAnsZodSchema.safeParse(req.query);

  if (!data.success) {
    throw ZodDataSafeParse(data, true);
  }

  let { examid, number, part, ans, ismultiple } = data.data;
  let userid = req.user;
  let Ans = ans.split(",");
  let status = await em.submitAnswer(
    examid,
    userid,
    part,
    Ans,
    number,
    ismultiple
  );
  // call back to user
  if (status) {
    console.log("status", status);
    console.log("ans added ....");
  }

  if (!status) {
    return res.status(400).json({
      success: false,
      message: `response not found`,
    });
  }

  return res.json({
    success: true,
    message: `ans collected`,
    data: "collected",
  });
});

export const finalsubmitExam = asyncHandler(async (req: any, res: any) => {
  let examid = req.query.examid;
  let userid = req.user;

  let status = await em.submitExam(examid, userid);
  // call back to user
  if (status) {
    console.log("status", status);
    console.log("Exam Submited  ....");
  }

  if (!status) {
    return res.status(400).json({
      success: false,
      message: `response not found`,
    });
  }

  return res.json({
    success: true,
    message: `Exam Submited Successfully ...`,
    data: "collected",
  });
});

//exam

export const joinedExamData = asyncHandler(async (req: any, res: any) => {
  let examid = req.query.examid;
  let type = req.query.type;
  let number = req.query.number;
  let part = req.query.part;
  let userid = req.user;

  let question = await em.getquestion(type, examid, userid, part, number);

  if (!question) {
    return res.status(400).json({
      success: false,
      message: `Question not found`,
    });
  }

  res.json({
    success: true,
    message: ` All user Exams`,
    data: question,
  });
});

export const examJoinRequestProcess = asyncHandler(
  async (req: any, res: any) => {
    let examid = req.query.id;
    let userid = req.user;

    let isUserVerified = await prisma.user.findFirst({
      where: { id: userid },
      select: {
        verification: {
          select: {
            telegram: true,
            email: true,
            whatsapp: true,
          },
        },
      },
    });

    if (
      !(
        isUserVerified?.verification?.email &&
        isUserVerified.verification.telegram
      )
    ) {
      return res.status(400).json({
        success: false,
        message: `The user needs to verify their account to take the given exam`,
      });
    }

    let isUserGivenThisExam = await prisma.score.findFirst({
      where: {
        exam_id: examid,
        user_id: userid,
      },
      select: {
        id: true,
      },
    });

    // exam data

    let exam = await prisma.exam.findFirst({
      where: { id: examid },
      select: {
        id: true,
        creationstatus: true,
        examtype: true,
        starttime: true,
        jointime: true,
        date: true,
      },
    });

    if (!exam) {
      return res
        .status(400)
        .json({ success: false, message: `Can not find any exam` });
    }

    if (exam.creationstatus === "Done") {
      //check here i can able to attempt multiple times
      // **********************************************************************************************************************
      if (exam.examtype !== "Mock" && exam.examtype !== "PYQ") {
        // mocke exam can be given multiple times

        if (isUserGivenThisExam && isUserGivenThisExam.id) {
          return res.status(400).json({
            success: false,
            message: `You have already taken this exam. Please join the next one.`,
          });
        }

        // join time checking
        {
          let examDate = dayjs.utc(exam.date).tz("Asia/Kolkata"); //.format("DD-MM-YYYY"); // Parse time correctly
          let currentISTTime = dayjs.utc().tz("Asia/Kolkata");

          let isSame = currentISTTime.isSame(examDate, "day"); //.format("DD-MM-YYYY")
          let date = examDate.format("DD-MM-YYYY");

          if (isSame) {
            let startTime = dayjs.tz(
              `${date} ${exam.starttime}`,
              "DD-MM-YYYY hh:mm a",
              "Asia/Kolkata"
            );
            let started = currentISTTime.isAfter(startTime);

            if (started) {
              let jointime = exam?.jointime as string;
              if (jointime == "no limit") {
                jointime = "00:15 m";
              }
              const minutesMatch = jointime.match(/(\d+):(\d+)/); // Matches "00:15"
              let joinTimeLimit;
              if (minutesMatch) {
                const [_, hours, minutes] = minutesMatch.map(Number);
                joinTimeLimit = startTime
                  .add(hours, "hour")
                  .add(minutes, "minute");
              } else {
                console.error("Invalid jointime format:", jointime);
              }

              let isExamJoinTimeExecd = currentISTTime.isAfter(joinTimeLimit);

              if (isExamJoinTimeExecd) {
                return res.status(400).json({
                  success: false,
                  message: `Exam Joining Time is over`,
                });
              }
            } else {
              let remainingTime = Math.max(
                startTime.diff(currentISTTime, "minutes"),
                0
              );
              return res.status(400).json({
                success: false,
                message: `Exam not started yet , remining time is ${remainingTime} m`,
              });
            }
          } else {
            return res.status(400).json({
              success: false,
              message: `Exam Joining Time is over/not started`,
            });
          }
        }
      }

      // **********************************************************************************************************************

      // transaction point 1) check user balance 2) deduct balance 3) add user to exam 4)send notification
      let trx = await prisma.$transaction(async (tx: any) => {
        let transaction = await TokenDeduction(
          tx,
          userid,
          exam.examtype,
          "service"
        );

        if (transaction) {
          em.addexam(exam.id);
          console.log("date added into exam manager");
          em.user.adduser(examid, req.user);
          console.log("user added into exam manager");
        }
      });
    }

    return res.json({
      success: true,
      message: `Exam setup Successfull ...`,
      data: "no data",
    });
  }
);

export const getExamYearInfo = asyncHandler(async (req: any, res: any) => {
  let { examname, id } = req.query;

  let exam_year;
  if (id) {
    exam_year = await prisma.examYear.findFirst({
      where: {
        id: id,
      },
    });
  } else {
    exam_year = await prisma.examYear.findMany({
      where: {
        targetExam: {
          shortCode: examname,
        },
      },
    });
  }

  if (!exam_year) throw Error("exam year info not  found");

  return res.json({
    success: true,
    message: `Exam Submited Successfully ...`,
    data: exam_year,
  });
});

export const getExamsbyid = asyncHandler(async (req: any, res: any) => {
  let response;

  response = await prisma.exam.findMany({
    where: {
      id: req.query.id,
    },
    select: {
      id: true,
      name: true,
      examname: true,
      display_id: true,
      exam_pattern: {
        select: {
          id: true,
          total_questions: true,
          syllabus: true,
          difficulty: true,
          format: true,
        },
      },
      category: true,
      Visibility: true,
      examtype: true,
      starttime: true,
      creationstatus: true,

      date: true,
      duration: true,
      jointime: true,
      ContestRegister: {
        select: {
          count: true,
        },
      },
    },
  });

  return res.json({
    success: true,
    message: `${response.length < 1 ? " No Exams found" : "All  Exams "} `,
    data: response,
  });
});

export const getExams = asyncHandler(async (req: any, res: any) => {
  let response;
  let total;
  let type = req.query.type;
  let page = req.query.page ?? 1;
  let limit = req.query.limit
    ? typeof req.query.limit === "string"
      ? parseInt(req.query.limit)
      : req.query.limit
    : 10;
  let order: "desc" | "asc" = req.query.order === "asc" ? "asc" : "desc";

  const pageNumber = page ? parseInt(page) : 1;

  if (req.query.starttime && req.query.endtime) {
    response = await prisma.exam.findMany({
      where: {
        AND: [
          {
            OR: [{ created_by: req.user }, { Visibility: Visibility.Public }],
          },
          {
            date: {
              gte: req.query.starttime, // Greater than or equal to startTime
              lte: req.query.endtime, // Less than or equal to endTime
            },
          },
        ],
        ...(type ? { examtype: type } : {}),
        creationstatus: "Done",
      },
      select: {
        id: true,
        name: true,
        examname: true,
        display_id: true,
        exam_pattern: {
          select: {
            id: true,
            total_questions: true,
            syllabus: true,
            difficulty: true,
            format: true,
          },
        },
        category: true,
        Visibility: true,
        examtype: true,
        starttime: true,
        creationstatus: true,
        date: true,
        duration: true,
        jointime: true,
        ContestRegister: {
          select: {
            count: true,
          },
        },
      },

      skip: (pageNumber - 1) * limit,
      take: limit,
      orderBy: { date: order },
    });

    total = await prisma.exam.count({
      where: {
        AND: [
          {
            OR: [{ created_by: req.user }, { Visibility: Visibility.Public }],
          },
          {
            date: {
              gte: req.query.starttime, // Greater than or equal to startTime
              lte: req.query.endtime, // Less than or equal to endTime
            },
          },
        ],
        ...(type ? { examtype: type } : {}),
        creationstatus: "Done",
      },
    });
  } else {
    response = await prisma.exam.findMany({
      where: {
        OR: [{ created_by: req.user }, { Visibility: Visibility.Public }],
        ...(type ? { examtype: type } : {}),
      },
      select: {
        id: true,
        name: true,
        examname: true,
        display_id: true,
        exam_pattern: {
          select: {
            id: true,
            total_questions: true,
            syllabus: true,
            difficulty: true,
            format: true,
          },
        },
        category: true,
        Visibility: true,
        examtype: true,
        starttime: true,
        creationstatus: true,

        date: true,
        duration: true,
        jointime: true,
        ContestRegister: {
          select: {
            count: true,
          },
        },
      },

      skip: (pageNumber - 1) * limit,
      take: limit,
      orderBy: { date: order },
    });

    total = await prisma.exam.count({
      where: {
        OR: [{ created_by: req.user }, { Visibility: Visibility.Public }],
        ...(type ? { examtype: type } : {}),
      },
    });
  }

  res.json({
    success: true,
    message: `${
      response.length < 1 ? " No Exams found" : `${response.length} All  Exams `
    } `,
    data: { exams: response, total: total, currentPage: pageNumber },
  });
});

export const getAvalibletargetExamAll = asyncHandler(
  async (req: any, res: any) => {
    let response = await prisma.targetExam.findMany({
      select: {
        name: true,
        shortCode: true,
        id: true,
      },
    });

    if (!(response.length > 0)) {
      throw new Error("Can not find any exam");
    }

    let AvalibleExam = response.flat(); // for --> AvalibleExam

    return res.json({
      success: true,
      message: ` avalible Exam  names`,
      data: AvalibleExam,
    });
  }
);
export const getAvalibletargetExam = asyncHandler(
  async (req: any, res: any) => {
    let category = req.query.category.toUpperCase();

    let response = await prisma.targetExam.findMany({
      where: {
        category: category,
      },
      select: {
        name: true,
        shortCode: true,
        id: true,
      },
    });

    if (!(response.length > 0)) {
      throw new Error("Can not find any exam");
    }

    let AvalibleExam = response.flat(); // for --> AvalibleExam

    return res.json({
      success: true,
      message: ` avalible Exam  names`,
      data: AvalibleExam,
    });
  }
);

export const getAvalibleExamPattern = asyncHandler(
  async (req: any, res: any) => {
    let exam = req.query.exam.toUpperCase();
    let user = req.user;

    let response = await prisma.exam_pattern.findMany({
      where: {
        examname: exam,
        created_by: user, // is id or full data
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (!response) {
      return res
        .status(400)
        .json({ success: false, message: `Can not find any exampattern` });
    }

    res.json({
      success: true,
      message: `alalible Exam patterns`,
      data: response,
    });
  }
);
