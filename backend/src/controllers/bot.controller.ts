import prisma from "@repo/db/index";
import { ExamType } from "@repo/prisma/client";
import {
  banuser_notification_zod_type,
  unbanuser_notification_zod_type,
} from "../zod/bot.zod";
import { asyncHandler } from "@repo/lib/helper/asyncHandler";

export const test = asyncHandler(async (req: any, res: any) => {
  res.json({ success: true, message: "message", data: "data" });
});

export const examQuestionAddedCompletionStatusCheck = asyncHandler(
  async (req: any, res: any) => {
    let { examid } = req.params;

    let exam_data = await prisma.exam.findFirst({
      where: {
        id: examid,
      },
      select: {
        exam_pattern: {
          select: {
            total_questions: true,
          },
        },
        creationstatus: true,
      },
    });

    if (!exam_data) throw Error("exam data not found for status checking ");

    if (exam_data.creationstatus == "Done") {
      throw Error("exam's status already checked");
    } else {
      await Promise.all(
        exam_data.exam_pattern.total_questions.map(async (num, idx) => {
          let count = await prisma.question_map.count({
            where: {
              examid: examid,
              part: `part${idx + 1}`,
            },
          });

          if (count !== num) {
            throw Error(
              `exam's(${examid}) part${
                idx + 1
              }  question count not match with question number`
            );
          }
        })
      );
    }

    let exam = await prisma.exam.update({
      where: {
        id: examid,
      },
      data: {
        creationstatus: "Done",
      },
      select: {
        id: true,
        name: true,
        creationstatus: true,
      },
    });

    if (!exam) throw Error("exam not found");

    return res.json({
      success: true,
      message: "question added succussful , exam status changed to done",
      data: exam,
    });
  }
);

export const getSyllabusDataForExamCreattion = asyncHandler(
  async (req: any, res: any) => {
    let syllabusid = req.query.syllabusid;

    if (!syllabusid) throw Error("syllabus id not recived ....");

    let syllabus_data = await prisma.syllabus.findFirst({
      where: {
        id: syllabusid,
      },
      select: {
        SubjectSyllabusMap: {
          select: {
            subject: {
              select: {
                shortName: true,
              },
            },
          },
        },
      },
    });

    if (!syllabus_data) throw Error("syllabus data not found ....");

    let syllabus = syllabus_data.SubjectSyllabusMap.map((item) => {
      return item.subject.shortName;
    });

    return res.json({ success: true, message: "message", data: syllabus });
  }
);

export const getQuestionViaIds = asyncHandler(async (req: any, res: any) => {
  let ids = req.body;
  let question_data = await prisma.questions.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    select: {
      id: true,
      title: true,
      topic_id: true,
      difficulty: true,
      subject_id: true,
      explanation: true,
      is_multiple_ans: true,
      status: true,
    },
  });
  if (!question_data) throw new Error("questions ids inbalid ");

  return res.json({
    success: true,
    message: "question info ",
    data: question_data,
  });
});

export const setUserProgress = asyncHandler(async (req: any, res: any) => {
  let { userid } = req.query;
  let { lastExamid, examType } = req.body;
  let responce;

  switch (examType as ExamType) {
    case "Test":
      {
        responce = await prisma.progress.update({
          where: {
            userid: userid,
          },
          data: {
            lastExamid: lastExamid,
          },
        });
      }
      break;
    case "Quiz":
      {
        {
          responce = await prisma.progress.update({
            where: {
              userid: userid,
            },
            data: {
              lastQuizid: lastExamid,
            },
          });
        }
      }
      break;
    case "Dpp":
      {
        {
          responce = await prisma.progress.update({
            where: {
              userid: userid,
            },
            data: {
              lastDppid: lastExamid,
            },
          });
        }
      }
      break;
    case "Contest":
      {
        {
          responce = await prisma.progress.update({
            where: {
              userid: userid,
            },
            data: {
              lastContestid: lastExamid,
            },
          });
        }
      }
      break;
    case "Mock":
      {
        {
          responce = await prisma.progress.update({
            where: {
              userid: userid,
            },
            data: {
              lastMockid: lastExamid,
            },
          });
        }
      }
      break;

    default:
      console.log("unknown test / service id ");
      throw new Error("unknown test / service id ");
  }

  res.json({ success: true, message: " progress updated for ", data: userid });
});

export const getExamDetails = asyncHandler(async (req: any, res: any) => {
  let examid = req.params.examid;
  let data = await prisma.exam.findFirst({
    where: {
      id: examid,
    },
  });
  if (!data) {
    throw new Error("exam details not found !");
  }
  res.json({ success: true, message: "message", data: data });
});

export const processNotification = async (req: any, res: any) => {
  try {
    let type = req.query.type;
    let data = req.body;
    switch (type) {
      case "unbanuser":
        {
          try {
            let processedData = unbanuser_notification_zod_type.safeParse(data);

            if (!processedData.success) {
              console.log("data error ---> ", processedData.error);

              return res.status(400).json({
                success: false,
                message: "notification catch ,but data not recived ",
              });
            }

            let { user_id, chat_id } = processedData.data;
            let isExists = await prisma.telegram_ban_user.findUnique({
              where: {
                user_telegram_id_ban_from_id: {
                  user_telegram_id: user_id,
                  ban_from_id: chat_id,
                },
              },
            });
            if (isExists) {
              let status = await prisma.telegram_ban_user.delete({
                where: {
                  user_telegram_id_ban_from_id: {
                    user_telegram_id: user_id,
                    ban_from_id: chat_id,
                  },
                },
              });

              if (!status) {
                return res.status(400).json({
                  success: false,
                  message: "ban user record not found or already unbanned",
                });
              }
            }

            res.json({ success: true, message: "notification catch" });
          } catch (error) {
            console.log("Error in unbanuser notification process --->", error);
            return res.status(500).json({
              success: false,
              message: "server error while processing unbanuser notification",
            });
          }
        }
        // process}

        break;
      case "banuser":
        {
          try {
            let processedData = banuser_notification_zod_type.safeParse(data);
            if (!processedData.success) {
              return res.status(400).json({
                success: false,
                message: "notification catch ,but data not recived ",
              });
            }

            let { user_id, chat_id, ban_from_type } = processedData.data;

            let staus = await prisma.telegram_ban_user.create({
              data: {
                user_telegram_id: user_id,
                bot_id: req.bot_user,
                ban_from_id: chat_id,
                ban_from_type: ban_from_type,
                status: "Ban",
              },
            });

            if (staus) {
              return res.json({ success: true, message: "notification catch" });
            } else {
              return res.status(400).json({
                success: false,
                message: "notification catch ,but error while process",
              });
            }
            // process
          } catch (error) {
            console.log("Error in banuser notification process --->", error);
            return res.status(500).json({
              success: false,
              message: "server error while processing banuser notification",
            });
          }
        }
        break;

      default:
        console.log(
          "unknown notification from bot ---> type is ->",
          type,
          " bot id is ---> ",
          req.bot_user
        );

        break;
    }
    res.json({ success: true, message: "message", data: "data" });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};
