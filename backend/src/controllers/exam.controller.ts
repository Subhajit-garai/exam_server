import {
  ExamStatus,
  ExamType,
  syllabusType,
  Visibility,
} from "@repo/packages/prisma";
import prisma from "@repo/db/index";
import {
  ExamCreateInputeSchema,
  ExampatternInputZodSchema,
} from "../zod/user.zod";
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
  create_targated_exam_year_zodSchemea,
  create_targated_exam_zodSchemea,
  updare_targated_exam_year_zodSchemea,
} from "../zod/exam.zod";
import { ZodDataSafeParse } from "@repo/lib/ZodTypeChecker";
import { debuglog } from "util";
import { ConvertInSlug } from "@/lib/slug";

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

// export const findexam = async (req: any, res: any) => {
//   try {
//     let category = req.query.category.toUpperCase();

//     let response = await prisma.targetExam.findMany({
//       where: {
//         category: category,
//       },
//     });

//     if (!(response.length > 0)) {
//       return res
//         .status(400)
//         .json({ success: false, message: `Can not find any Category` });
//     }

//     let AvalibleExam = response.flat().map(item=> item.name)

//     res.json({
//       success: true,
//       message: ` alalible Exam  names`,
//       for: AvalibleExam,
//     });
//   } catch (error) {
//     console.log("Error in exam controller", error);
//   }
// };

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

export const create_targeted_exam = asyncHandler(async (req: any, res: any) => {
  let processedata = create_targated_exam_zodSchemea.safeParse(req.body);
  if (!processedata.success) {
    throw ZodDataSafeParse(processedata, true);
  }
  let target_exam = await prisma.targetExam.create({
    data: {
      ...processedata.data,
    },
  });

  return res.json({
    success: true,
    message: "targated_exam created successfuly",
    data: target_exam.name,
  });
});
export const create_targeted_exam_year = asyncHandler(
  async (req: any, res: any) => {
    let processedata = create_targated_exam_year_zodSchemea.safeParse(req.body);

    if (!processedata.success) {
      throw ZodDataSafeParse(processedata, true);
    }

    let target_exam_data = await prisma.targetExam.findFirst({
      where: {
        id: processedata.data.targetExamId,
      },
    });

    if (!target_exam_data) throw new Error("select valid exam name ");

    processedata.data.slug = ConvertInSlug(
      `${target_exam_data.shortCode} ${processedata.data.year}`
    );

    let target_exam_year = await prisma.examYear.create({
      data: {
        ...processedata.data,
        slug: processedata.data.slug,
        year: parseInt(processedata.data.year),
      },
    });

    if (!target_exam_year) throw new Error("targated_exam_year not created ");
    return res.json({
      success: true,
      message: "targated_exam_year created successfuly",
      data: target_exam_year.year,
    });
  }
);

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
  let examdata: any = await prisma.exam.findFirst({
    where: { id: examid },
    select: {
      examtype: true,
      mockSetId: true,
    },
  });

  let allids: [] = [];
  let partinfo: any = {};
  let data: any;

  if (!examdata) {
    throw new Error("provided exam information incorrect ");
  }
  let { examtype, questions, mockSetId } = examdata;

  switch (examtype) {
    case "Mock":
      {
        if (!mockSetId) {
          console.log("in mock ans set generator :- mock set is null");
        }
        // let mocksetData = await prisma.mock_questions_set.findFirst({
        //   where: { id: mockSetId },
        //   select: {
        //     questions: true,
        //   },
        // });

        let questions = await prisma.mock_question_map.findMany({
          where: {
            mockid: mockSetId,
          },
        });

        data = questions;
      }
      break;
    case "PYQ":
      {
        if (!mockSetId) {
          console.log("in pyq ans set generator :- mock set is null");
        }
        // let mocksetData = await prisma.mock_questions_set.findFirst({
        //   where: { id: mockSetId },
        //   select: {
        //     questions: true,
        //   },
        // });

        let questions = await prisma.mock_question_map.findMany({
          where: {
            mockid: mockSetId,
          },
        });
        data = questions;
      }
      break;
    case "Exam":
      data = questions;

      break;
    case "Dpp":
      data = questions;

      break;

    default:
      console.log("invalid or incorrect exam type");

      break;
  }

  Object.keys(data).map((p: any) => {
    let ids = Object.values(data[p]).flat() as [];

    if (!partinfo[p]) {
      partinfo[p] = {};
    }
    ids.map((id: any, i) => {
      partinfo[p][i + 1] = id;
    });
    allids = [...allids, ...ids];
  });

  // this.questionsids[examid] = partinfo;
  // console.log("allids.length -->", allids.length);
  // console.log("allids -->", allids);

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
        difficulty: true,
        is_multiple_ans: true,
        subject_id: true,
        topic_id: true,
      },
    });

    if (res) {
      // console.log("here ---->");

      return res;
    } else {
      // console.log("i ---->");
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

export const CreateNewExamPattern = async (req: any, res: any) => {
  try {
    let data = ExampatternInputZodSchema.safeParse(req.body);
    if (!data.success) {
      console.log("data error", data.error);

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
      let target_exam = await prisma.targetExam.findFirst({
        where: {
          name: examname.toUpperCase(),
        },
      });

      let syllabus = await prisma.syllabus.findFirst({
        where: {
          exam_year_id: target_exam?.id, // syllabus are attach with target exam year
        },
      });

      if (!syllabus) throw Error("syllabus not found ");

      let subject_data = await prisma.subjectSyllabusMap.findMany({
        where: {
          syllabusId: syllabus.id,
        },
      });

      if (!subject_data) throw Error("subject_data not found ");

      let subject_id_arr = subject_data.map((sub) => sub.id);

      topics = subject_id_arr; // here i pass subject map  id , and later i get topic by an api request
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

// working here
export const CreateExam = async (req: any, res: any) => {
  try {
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
      Visibility,
      category,
      duration,
      date,
      jointime,
      starttime,
      examtype, // new
      mock_questions_set_id, // new
    } = data.data;

    let response;
    let Notifystatus;

    switch (examtype) {
      case "Mock":
        {
          // check all mock exam set is ready or not
          console.log("---------------->", mock_questions_set_id);

          if (!mock_questions_set_id) throw new Error("Mock set id not found");

          let exam_pattern_data = await prisma.exam_pattern.findFirst({
            where: { id: exam_pattern_id },
          });

          if (!exam_pattern_data) throw new Error("exam pattern not found");

          let { total_questions, part_Count, topics } = exam_pattern_data;

          let mock_questions_set = await prisma.mock_questions_set.findFirst({
            where: {
              id: mock_questions_set_id,
            },
          });

          if (!mock_questions_set) {
            throw new Error("Mock exam set not found");
          } else {
            // if (mock_questions_set.status !== "Done") {
            //   throw new Error(
            //     `Mock exam set's Question sets not fully configured status -> ${mock_questions_set.status}`
            //   );
            // }
          }
          // chect exam_pattern_id and mock_questions_set_id are same or not
          if (exam_pattern_data.title !== mock_questions_set?.pattern) {
            throw new Error("Mock exam set and exam pattern are not same");
          }

          total_questions.map((part: number, indx: number) => {
            if (part !== mock_questions_set?.total_questions[indx]) {
              throw new Error(
                `Mock set part total_Question not match part --> ${indx + 1}`
              );
            }
          });

          response = await prisma.exam.create({
            data: {
              name,
              examname,
              Visibility,
              category,
              examtype: examtype,
              starttime: "no limit",
              jointime: "no limit",
              duration: duration ? duration : "02:00 h",
              mockSetId: mock_questions_set_id,
              date: date,
              // questions: {},
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

          let { id } = response;
          Notifystatus = await em.getredisclient().push({
            //id :
            type: "CreateExam",
            examid: id,
            userid: user,
            examtype: response.examtype,
          });
        }
        break;

      default:
        {
          response = await prisma.exam.create({
            data: {
              name,
              examname,
              Visibility,
              category,
              examtype: examtype,
              starttime: starttime ? starttime : "no limit",
              jointime: jointime ? jointime : "no limit",
              duration: duration ? duration : "02:00 h",
              date: date,
              // questions: {},
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
          Notifystatus = await em.getredisclient().push({
            //id :
            type: "CreateExam",
            examid: id,
            userid: user,
            examtype: response.examtype,
          });
        }
        break;
    }

    // call back to user
    if (Notifystatus) {
      console.log(`${examtype} Created ....`);
    }

    // end

    res.json({
      success: true,
      message: `New ${examtype}  Created Successful`,
    });
  } catch (error: any) {
    console.log("CreateExam ERROR", error);
    return res.status(500).json({
      success: false,
      message: error?.message,
    });
  }
};

// checked 2.0
export const getCategory = async (req: any, res: any) => {
  try {
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
  } catch (error) {
    console.log(error);
  }
};

export const getAvalibleExam = asyncHandler(async (req: any, res: any) => {
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
});

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
        response.length < 1
          ? " No Exams found"
          : `${response.length} All  Exams `
      } `,
      data: { exams: response, total: total, currentPage: pageNumber },
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
      data: response,
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

    if (exam.creationstatus === "Done") {
      //check here i can able to attempt multiple times
      // **********************************************************************************************************************4
      if (exam.examtype !== "Mock" && exam.examtype !== "PYQ") {
        // mocke exam can be given multiple times

        if (isUserGivenThisExam && isUserGivenThisExam.id) {
          // console.log("isUserGivenThisExam", isUserGivenThisExam);
          console.log("user already given this exam");
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
          // exam set up begine

          // check exam is type of  mock  , if mock  then point exam question set to  mocke exam set

          let data: { questions: any } | null = { questions: {} };

          switch (exam.examtype) {
            // case "Exam":
            //   break;
            case "PYQ":
              {
                // colect question from mock exam set
                if (exam?.mockSetId == null) {
                  throw new Error("PYQ exam does not have any mock set.");
                }
                let mock_questions_set_status =
                  await tx.mock_questions_set.findFirst({
                    where: {
                      id: exam?.mockSetId,
                    },
                    select: {
                      status: true,
                    },
                  });

                if (mock_questions_set_status?.status === "Done") {
                  data = await tx.mock_questions_set.findFirst({
                    where: {
                      id: exam?.mockSetId,
                    },
                    select: {
                      questions: true,
                    },
                  });

                  //  update when change

                  // data = await tx.question_map.findMany({
                  //   where:{
                  //     examid:exam.id
                  //   }
                  // })
                } else {
                  throw new Error("PYQ exam set is not ready yet.");
                }
              }
              break;

            case "Mock":
              {
                // colect question from mock exam set
                if (exam?.mockSetId == null) {
                  throw new Error("Mock exam does not have any mock set.");
                }
                let mock_questions_set_status =
                  await tx.mock_questions_set.findFirst({
                    where: {
                      id: exam?.mockSetId,
                    },
                    select: {
                      status: true,
                    },
                  });
                if (mock_questions_set_status?.status === "Done") {
                  data = await tx.mock_questions_set.findFirst({
                    where: {
                      id: exam?.mockSetId,
                    },
                    select: {
                      questions: true,
                    },
                  });

                  // data = await tx.question_map.findMany({
                  //   where:{
                  //     examid:exam.id
                  //   }
                  // })
                } else {
                  throw new Error("Mock exam set is not ready yet.");
                }
              }
              break;

            default:
              // data = await tx.exam.findFirst({
              //   where: { id: examid },
              //   select: {
              //     questions: true,
              //   },
              // });

              data = await tx.question_map.findMany({
                where: {
                  examid: exam.id,
                },
              });

              if (!data) {
                throw new Error("Exam not found");
              }
          }

          // this line same for every type of exam so i can use it in last after checking all condition
          // data = await tx.question_map.findMany({
          //   where:{
          //     examid:exam.id
          //   }
          // })

          if (data) {
            em.addexam(examid, data, true); // it this function i can get and set into redis cache
            console.log("date added into exam manager");
            em.user.adduser(examid, req.user);
            console.log("user added into exam manager");
          }

          // progress update
          switch (exam.examtype) {
            case "Exam":
              {
                await tx.progress.update({
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
              break;
            case "Mock":
              {
                await tx.progress.update({
                  where: {
                    userid: userid,
                  },
                  data: {
                    attempted: {
                      increment: 1,
                    },
                    attendedMock: {
                      increment: 1,
                    },
                  },
                });
              }
              break;
            case "PYQ":
              {
                await tx.progress.update({
                  where: {
                    userid: userid,
                  },
                  data: {
                    attempted: {
                      increment: 1,
                    },
                    attendedPYQ: {
                      increment: 1,
                    },
                  },
                });
              }
              break;
            case "Contest":
              await tx.progress.update({
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
              console.log("undefind exam type ", exam.examtype);
          }

          await tx.exam.update({
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
      });

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
        success: false,
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

    let question = await em.getquestion(
      type,
      examid,
      userid,
      part,
      number,
      true
    );

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
      ismultiple,
      true
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
