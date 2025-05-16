import { ExamStatus, ExamType, syllabusType } from "@prisma/client";
import prisma from "../../db";
import {
  ExamCreateInputeSchema,
  ExamCreateInputeSchema_tyoe_2,
  ExampatternInputZodSchema,
  SyllabusInputZodSchema,
} from "../zod/user.zod";
import { examManager } from "../../lib/examManager";
import { ExamMetaData } from "../../lib/types";
import { SubmitedQuestionAnsZodSchema } from "../zod/question.zod";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { TokenDeduction } from "./payment.controller";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const em = examManager.getInstance();

export const test = async (req: any, res: any) => {
  try {
    res.json({ success: true, message: "message", data: "data" });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const getUserAnsSetOfAnExam = async (req: any, res: any) => {
  try {
    let examid = req.query.examid;
    let userid = req.user;

    let data = await prisma.userAns.findFirst({
      where: {
        userId: userid,
        examId: examid,
      },
      select: {
        ans: true,
      },
    });
    res.json({ success: true, message: "message", data: data });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const ExamAnsGenerator = async (examid: string) => {
  let data: any = await prisma.exam.findFirst({
    where: { id: examid },
    select: {
      questions: true,
    },
  });

  let allids: [] = [];
  let partinfo: any = {};

  Object.keys(data).map((d: any) => {
    Object.keys(data[d]).map((p: any) => {
      let ids = Object.values(data[d][p]).flat() as [];

      if (!partinfo[p]) {
        partinfo[p] = {};
      }
      ids.map((id: any, i) => {
        partinfo[p][i + 1] = id;
      });
      allids = [...allids, ...ids];
    });
  });

  // this.questionsids[examid] = partinfo;

  if (allids.length > 0) {
    let res = await prisma.questions.findMany({
      where: {
        id: {
          in: allids,
        },
      },
      select: {
        id: true,
        title: true,
        options: true,
        ans: true,
        topic: true,
        difficulty: true,
        // explanation: true,
        // links: true,
      },
    });

    if (res) {
      return res;
    } else {
      return null;
    }
  }
};

export const getExamAnsForAnalisys = async (req: any, res: any) => {
  try {
    let examid = req.query.examid;
    let generatedAns = await ExamAnsGenerator(examid);
    if (generatedAns) {
      res.json({ success: true, message: "Ans Sended", data: generatedAns });
    } else {
      res.json({ success: false, message: "No questions found" });
    }
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const ExamAttemptQuestionMetaData = async (req: any, res: any) => {
  try {
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
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

// processing
// in dev

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

// complete
// token system

export const gettokenSystem = async (req: any, res: any) => {
  try {
    let data;
    let type = req.query.type;
    let response = await prisma.entryChargeList.findFirst({});

    if (!response) {
      return res.status(400).json({
        success: false,
        message: `tokenSystem not avalible`,
      });
    }

    switch (type) {
      case ExamType.Contest:
        data = response.contest;
        break;
      // case ExamType.: data = response.quiz;
      //   break;

      default:
        data = response.exam;
        break;
    }

    res.json({
      success: true,
      message: `tokenSystem for exam `,
      data: data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: `tokenSystem not created`,
    });
  }
};
export const CreateSyllabus = async (req: any, res: any) => {
  try {
    let data = SyllabusInputZodSchema.safeParse(req.body);

    if (!data.success) {
      return res.status(401).json({
        success: false,
        message: "given credential/input   invalid ",
      });
    }

    let { category, examname, topics } = data.data;
    examname = examname.toUpperCase();
    let response = await prisma.syllabus.create({
      data: {
        category,
        examname,
        topics,
      },
    });

    if (!response) {
      return res.status(400).json({
        success: false,
        message: `Syllabus for ${examname} not created ,`,
      });
    }

    let syllabus = response.topics;

    res.json({
      success: true,
      message: `Syllabus for ${examname} are/is : ${syllabus}  seted `,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: `Syllabus not created , Exam Name Already exist ,`,
    });
  }
};

export const getSyllabus = async (req: any, res: any) => {
  try {
    let exam = req.query.syllabus;

    let response = await prisma.syllabus.findMany({
      where: {
        examname: exam.toUpperCase(),
      },
    });

    if (!response) {
      return res
        .status(400)
        .json({ success: false, message: `Syllabus for ${exam} not exist` });
    }

    let syllabus = response[0]?.topics;

    res.json({
      success: true,
      message: `Syllabus for ${exam}`,
      syllabus: syllabus,
    });
  } catch (error) {
    console.log("Error in getsyllabus", error);
  }
};

export const CreateNewExamPattern = async (req: any, res: any) => {
  try {
    let data = ExampatternInputZodSchema.safeParse(req.body);
    if (!data.success) {
      return res.status(401).json({
        success: false,
        message: "given credential/input   invalid ",
      });
    }

    let {
      title,
      checkbox,
      format,
      examname,
      category,
      topics,
      difficulty,
      part,
      part_Count,
      total_questions,
      check,
      marks_values,
      neg_values,
    } = data.data;

    let user = req.user;

    if (checkbox) {
      let response = await prisma.syllabus.findFirst({
        where: {
          examname: examname.toUpperCase(),
        },
      });

      topics = response?.topics;
    } else {
      if ((topics?.length as number) < 1) {
        return res.status(400).json({
          success: false,
          message: "Topics is Empty ",
        });
      }
    }

    let response = await prisma.exam_pattern.create({
      data: {
        title,
        format,
        examname,
        category,
        topics,
        difficulty,
        part,
        part_Count,
        total_questions,
        check,
        marks_values,
        neg_values,
        syllabus: check ? syllabusType.Syllabus : syllabusType.Generic,
        created_by: user,
      },
    });

    res.json({
      success: true,
      message: "New Exam Pattern Created Successful",
    });
  } catch (error) {
    console.log("CreateNewExamPattern ERROR", error);
  }
};

export const CreateExam = async (req: any, res: any) => {
  try {
    // console.log(req.body)

    let data = ExamCreateInputeSchema.safeParse(req.body);
    let user = req.user;

    if (!data.success) {
      return res.status(401).json({
        success: false,
        message: "given credential/input   invalid ",
      });
    }
    let {
      name,
      examname,
      exam_pattern_id,
      status,
      category,
      duration,
      date,
      jointime,
      starttime,
    } = data.data;

    let response = await prisma.exam.create({
      data: {
        name,
        examname,
        status,
        category,
        starttime: starttime ? starttime : "no limit",
        jointime: jointime ? jointime : "no limit",
        duration: duration ? duration : "02:00 h",
        date: date,
        questions: {},
        exam_pattern: {
          connect: { id: exam_pattern_id },
        },
        User: {
          connect: { id: user }, // createdby
        },
        AnsSheet: {
          create: {
            ans: {},
          },
        },
        ContestRegister: {
          create: {},
        },
      },
    });

    if (!response) {
      return res.status(500).json({
        success: false,
        message: "Exam not created , try again later ",
      });
    }

    // send it into queue to process question
    let { id } = response;
    let Notifystatus = await em.getredisclient().push({
      type: "CreateExam",
      examid: id,
      userid: user,
    });
    // call back to user
    if (Notifystatus) {
      console.log("Notifystatus", Notifystatus);
      console.log("exam Created ....");
    }

    // end
    res.json({
      success: true,
      message: "New Exam Pattern Created Successful",
    });
  } catch (error) {
    console.log("CreateExam ERROR", error);
  }
};

// working here
export const CreateExam_type = async (req: any, res: any) => {
  try {
    let data = ExamCreateInputeSchema_tyoe_2.safeParse(req.body);

    let user = req.user;

    if (!data.success) {
      return res.status(401).json({
        success: false,
        message: "given credential/input   invalid ",
      });
    }

    let {
      name,
      examname,
      exam_pattern_id,
      status,
      category,
      duration,
      date,
      jointime,
      starttime,
      examtype, // new
      mock_questions_set_id, // new
    } = data.data;

    let response;

    switch (examtype) {
      case "Mock":
        // check all mock exam set is ready or not

        // check mock exam question set  meet  exam pattern requirement or not

        let exam_pattern_data = await prisma.exam_pattern.findFirst({
          where: { id: exam_pattern_id },
        });

        if (!exam_pattern_data) throw new Error("exam pattern not found");

        let { total_questions, part_Count, topics } = exam_pattern_data;
        let mock_questions_set = await prisma.mock_questions_set.findMany({
          where: {
            id: mock_questions_set_id,
          },
        });

        if (!mock_questions_set) {
          throw new Error("Mock exam set not found");
        }
        // chect exam_pattern_id and mock_questions_set_id are same or not
        if (exam_pattern_id !== mock_questions_set[0]?.exam_pattern_id) {
          throw new Error("Mock exam set and exam pattern are not same");
        }
        // question_subject_count check all subjects are present or not

        // let is_all_topic_are_present =  Object.keys().every()

        // question_part_count check all part are present or not

        // question count are equel or not

        // check mock exam set is ready or not

        break;

      default:
        response = await prisma.exam.create({
          data: {
            name,
            examname,
            status,
            category,
            examtype: examtype,
            starttime: starttime ? starttime : "no limit",
            jointime: jointime ? jointime : "no limit",
            duration: duration ? duration : "02:00 h",
            date: date,
            questions: {},
            exam_pattern: {
              connect: { id: exam_pattern_id },
            },
            User: {
              connect: { id: user }, // createdby
            },
            AnsSheet: {
              create: {
                ans: [],
              },
            },
            ContestRegister: {
              create: {},
            },
          },
        });

        if (!response) {
          return res.status(500).json({
            success: false,
            message: `${examtype} not created , try again later `,
          });
        }
        // send it into queue to process question
        let { id } = response;
        let Notifystatus = await em.getredisclient().push({
          //id :
          type: "CreateExam",
          examid: id,
          userid: user,
        });
        // call back to user
        if (Notifystatus) {
          console.log(`${examtype} Created ....`);
        }

        break;
    }

    // end

    res.json({
      success: true,
      message: `New ${examtype}  Created Successful`,
    });
  } catch (error) {
    console.log("CreateExam ERROR", error);
  }
};

export const getCategory = async (req: any, res: any) => {
  try {
    let response = await prisma.syllabus.findMany({});

    if (!response) {
      return res
        .status(400)
        .json({ success: false, message: `Can not find any Category` });
    }
    let Category = [];
    Category = response.map((c: any) => {
      return c.category;
    });
    res.json({
      success: true,
      message: ` alalible Categorys `,
      Category: Category,
    });
  } catch (error) {
    console.log(error);
  }
};

export const findexam = async (req: any, res: any) => {
  try {
    let category = req.query.category.toUpperCase();

    let response = await prisma.syllabus.findMany({
      where: {
        category: category,
      },
    });

    if (!(response.length > 0)) {
      return res
        .status(400)
        .json({ success: false, message: `Can not find any Category` });
    }

    let AvalibleExam = []; // // for --> AvalibleExam
    AvalibleExam = response.map((c: any) => {
      return c.examname;
    });

    res.json({
      success: true,
      message: ` alalible Exam  names`,
      for: AvalibleExam,
    });
  } catch (error) {
    console.log("Error in exam controller", error);
  }
};

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
export const getAvalibleExam = async (req: any, res: any) => {
  try {
    let response = await prisma.syllabus.findMany({});

    if (!(response.length > 0)) {
      return res
        .status(400)
        .json({ success: false, message: `Can not find any exam` });
    }

    let AvalibleExam = new Set(); // // for --> AvalibleExam
    response.map((c: any) => {
      // console.log("c.examname",c.examname);
      AvalibleExam.add(c.examname);
    });

    // console.log("AvalibleExam",AvalibleExam);

    res.json({
      success: true,
      message: ` alalible Exam  names`,
      for: [...AvalibleExam],
    });
  } catch (error) {
    console.log("Error in exam controller", error);
  }
};
export const getExamsbyid = async (req: any, res: any) => {
  try {
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
        status: true,
        examtype: true,
        starttime: true,
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

    res.json({
      success: true,
      message: `${response.length < 1 ? " No Exams found" : "All  Exams "} `,
      data: response,
    });
  } catch (error) {
    console.log("Error in exam controller", error);
  }
};
export const getExams = async (req: any, res: any) => {
  try {
    let response;
    let type = req.query.type;    
    let limit = req.query.limit ? req.query.limit : 10;

    if (req.query.starttime && req.query.endtime) {
      response = await prisma.exam.findMany({
        where: {
          AND: [
            {
              OR: [
                { created_by: req.user },
                { status: ExamStatus.Public },
              ],
            },
            {
              date: {
                gte: req.query.starttime, // Greater than or equal to startTime
                lte: req.query.endtime, // Less than or equal to endTime
              },
            },
          ],
          ...(type ? { examtype: type } : {}) 

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
          status: true,
          examtype: true,
          starttime: true,
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
    } else {
      response = await prisma.exam.findMany({
        where: {
          OR: [{ created_by: req.user }, { status: ExamStatus.Public }],
           ...(type ? { examtype: type } : {}) 
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
          status: true,
          examtype: true,
          starttime: true,
          date: true,
          duration: true,
          jointime: true,
          ContestRegister: {
            select: {
              count: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
        take: limit,
      });
    }    

    res.json({
      success: true,
      message: `${response.length < 1 ? " No Exams found" : `${response.length} All  Exams `} `,
      data: response,
    });
  } catch (error) {
    console.log("Error in exam controller", error);
  }
};

export const getAvalibleExamPattern = async (req: any, res: any) => {
  try {
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
      patterns: response,
    });
  } catch (error) {
    console.log("Error in exam controller", error);
  }
};

export const examJoinRequestProcess = async (req: any, res: any) => {
  try {
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
        mockSetId: true,
        date: true,
      },
    });

    if (!exam) {
      return res
        .status(400)
        .json({ success: false, message: `Can not find any exam` });
    }

    //check here i can able to attempt multiple times
    // **********************************************************************************************************************4
    if (exam.examtype !== "Mock") {
      // mocke exam can be given multiple times

      if (isUserGivenThisExam && isUserGivenThisExam.id) {
        // console.log("isUserGivenThisExam", isUserGivenThisExam);
        console.log("user already given this exam");
        return res.status(400).json({
          success: false,
          message: `You have already taken this exam. Please join the next one.`,
        });
      }
    }

    // **********************************************************************************************************************

    // transaction point 1) check user balance 2) deduct balance 3) add user to exam 4)send notification

    if (exam.creationstatus === "Done") {
      // join time checking

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
            joinTimeLimit = startTime.add(hours, "hour").add(minutes, "minute");
          } else {
            console.error("Invalid jointime format:", jointime);
          }

          let isExamJoinTimeExecd = currentISTTime.isAfter(joinTimeLimit);

          if (isExamJoinTimeExecd) {
            return res
              .status(400)
              .json({ success: false, message: `Exam Joining Time is over` });
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

      // transtion begine
      // let transaction = await prisma.$transaction(async (tx: any) => {
      //   // here get entry charge for exam , mock and contest subject
      //   const allamount = await tx.entryChargeList.findFirst({
      //     select: {
      //       exam: true,
      //       mock: true,
      //       contest: true,
      //       subject: true,
      //       quiz: true,
      //     },
      //   });

      //   let charge = 0;

      //   switch (exam.examtype) {
      //     case "Exam":
      //       charge = allamount?.exam ?? 2;
      //       break;
      //     case "Mock":
      //       charge = allamount?.mock ?? 2;
      //       break;
      //     case "Contest":
      //       charge = allamount?.contest ?? 2;
      //       break;
      //     case "Subject":
      //       charge = allamount?.subject ?? 2;
      //       break;
      //     default:
      //       charge = 2;
      //   }

      //   if (!charge && typeof charge != "number") {
      //     throw new Error("invalid  balance");
      //   }

      //   const userdata = await tx.user.findUnique({
      //     where: { id: userid },
      //     select: {
      //       blance: {
      //         select: {
      //           amount: true,
      //         },
      //       },
      //     },
      //   });

      //   if (!userdata?.blance) {
      //     throw new Error("userdata not found");
      //   }
      //   // Step 2: Check if the balance is sufficient
      //   if (userdata?.blance.amount < charge) {
      //     throw new Error("Insufficient balance");
      //   }

      //   let user_blance = await tx.blance.update({
      //     where: {
      //       userid: userid,
      //     },
      //     data: {
      //       amount: {
      //         decrement: charge,
      //       },
      //     },
      //     select: {
      //       amount: true,
      //     },
      //   });

      //   if (user_blance) {
      //     return true;
      //   }

      //   return false;
      // });

      let transaction = await TokenDeduction(userid, exam.examtype, "service");

      if (transaction) {
        // exam set up begine

        // check exam is type of  mock  , if mock  then point exam question set to  mocke exam set

        let data: { questions: any } | null = { questions: {} };

        switch (exam.examtype) {
          // case "Exam":
          //   break;
          case "Mock":
            // colect question from mock exam set
            if (exam?.mockSetId == null) {
              throw new Error("Mock exam does not have any mock set.");
            }
            let mock_questions_set_status =
              await prisma.mock_questions_set.findFirst({
                where: {
                  id: exam?.mockSetId,
                },
                select: {
                  status: true,
                },
              });
            if (mock_questions_set_status?.status === "Done") {
              data = await prisma.mock_questions_set.findFirst({
                where: {
                  id: exam?.mockSetId,
                },
                select: {
                  questions: true,
                },
              });
            } else {
              throw new Error("Mock exam set is not ready yet.");
            }

            break;
          // case "Contest":
          //   charge = allamount?.contest ?? 2;
          //   break;
          // case "Subject":
          //   charge = allamount?.subject ?? 2;
          //   break;
          default:
            data = await prisma.exam.findFirst({
              where: { id: examid },
              select: {
                questions: true,
              },
            });

            if (!data) {
              throw new Error("Exam not found");
            }
        }

        if (data) {
          em.addexam(examid, data);
          console.log("date added into exam manager");
          em.user.adduser(examid, req.user);
          console.log("user added into exam manager");
        }

        // progress update
        switch (exam.examtype) {
          // case "Exam":
          //   break;
          // case "Mock":
          //   break;
          // case "Subject":
          //   charge = allamount?.subject ?? 2;
          //   break;
          case "Contest":
            await prisma.progress.update({
              where: {
                userid: userid,
              },
              data: {
                attempted: {
                  increment: 1,
                },
                attendedContest: {
                  increment: 1,
                },
              },
            });
            break;
          default:
            await prisma.progress.update({
              where: {
                userid: userid,
              },
              data: {
                attempted: {
                  increment: 1,
                },
                attendedExam: {
                  increment: 1,
                },
              },
            });
        }

        await prisma.exam.update({
          where: {
            id: exam.id,
          },
          data: {
            ContestRegister: {
              update: {
                count: {
                  increment: 1,
                },
                users: {
                  push: userid,
                },
              },
            },
          },
        });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Transactions Failed" });
      }

      res.json({
        success: true,
        message: `Exam setup completed`,
        data: {
          examid: examid,
        },
      });
    } else {
      throw new Error(`Exam not ready to join`);
    }
  } catch (error) {
    console.log("Error in exam controller examJoinRequestProcess", error);

    if (error instanceof Error)
      res.status(400).json({
        success: true,
        message: error.message,
      });
  }
};

export const joinedExamData = async (req: any, res: any) => {
  try {
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
  } catch (error) {
    console.log("Error in exam controller", error);
  }
};

export const submitAnswerhandler = async (req: any, res: any) => {
  try {
    let data = SubmitedQuestionAnsZodSchema.safeParse(req.query);
    if (!data.success) {
      return res.status(400).json({
        success: false,
        message: "invalid data",
      });
    }
    let { examid, number, part, ans, ismultiple } = data.data;
    let userid = req.user;
    let Ans = ans.split(",");

    // console.log("ans", ans);
    // console.log("ans ty", typeof ans);

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

    res.json({
      success: true,
      message: `ans collected`,
      data: "collected",
    });
  } catch (error) {
    console.log("Error in exam controller", error);
  }
};
export const finalsubmitExam = async (req: any, res: any) => {
  try {
    let examid = req.query.examid;
    // let number = req.query.number;
    // let part = req.query.part;
    // let ans = req.query.ans;
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

    res.json({
      success: true,
      message: `Exam Submited Successfully ...`,
      data: "collected",
    });
  } catch (error) {
    console.log("Error in exam controller", error);
  }
};
