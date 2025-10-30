import { hashPasswordFn, veryfyhashPasswordFn } from "@repo/lib/security/hash";
import prisma from  "@repo/db/index";
import {
  CreationTypes,
  primeStatus,
  Prisma,
  UserRole,
  ExamType,
} from  "@repo/packages/prisma"
import {
  banuser_notification_zod_type,
  bot_create_quiz_data_ZodSchema,
  bot_singupZodSchema,
  unbanuser_notification_zod_type,
  update_botwebhook_ZodSchema,
} from "../zod/bot.zod";
import { genToken, verifyToken } from "@repo/lib/token";
import { QuizeSetupFunction } from "@repo/lib/helper/TelegramQuiz";
import { debuglog } from "@repo/lib/helper/debugLog";
import { asyncHandler } from "@repo/lib/helper/asyncHandler";
import { exam_question_format_type } from "@repo/lib/types/questionTypes";

export const test = asyncHandler(async (req: any, res: any) => {
  res.json({ success: true, message: "message", data: "data" });
});

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
export const getMockSetExamPattern = asyncHandler(
  async (req: any, res: any) => {
    let title = req.query.title;
    let exam_pattern_info = await prisma.exam_pattern.findFirst({
      where: {
        title: title,
      },
      select: {
        topics: true,
      },
    });

    if (!exam_pattern_info) throw new Error("exam pattern info not found ");
    return res.json({
      success: true,
      message: "mock  set pattern info ",
      data: exam_pattern_info,
    });
  }
);

export const setUserProgress = asyncHandler(async (req: any, res: any) => {
  let { userid } = req.query;
  let { lastExamid, examType } = req.body;
  let responce;

  switch (examType as ExamType) {
    case "Exam":
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

export const setUserScore = asyncHandler(async (req: any, res: any) => {
  let { examid, userid } = req.query;

  let userScore = req.body;

  let data = await prisma.score.findFirst({
    where: {
      exam_id: examid,
      user_id: userid,
    },
  });

  if (data) throw new Error("user score  present");

  let score = await prisma.score.create({
    data: {
      ...userScore,
    },
  });

  if (!score) throw new Error(" error while user score adding ");

  return res.json({ success: true, message: "user score added ", data: score });
});

export const getUserScore = asyncHandler(async (req: any, res: any) => {
  let { examid, userid } = req.query;
  let data = await prisma.score.findFirst({
    where: {
      exam_id: examid,
      user_id: userid,
    },
  });

  if (!data)
    return res.json({
      success: true,
      message: "user score not present ",
      data: null,
    });

  return res.json({ success: true, message: "user score  ", data: data });
});

export const getMockAns = asyncHandler(async (req: any, res: any) => {
  let mockid = req.params.mockid;

  type ansFormat = {
    id: string; // number
    ans: string[];
    part: string;
    topic_id: string;
  };

  let ANS: ansFormat[] = [];
  let questions = await prisma.mock_question_map.findMany({
    where: {
      mockid: mockid,
    },
  });

  if (!questions) throw new Error("Exam invalid or exam doesn't have any ans ");

  let questionids = questions.map((item) => item.questionid);

  let question_data = await prisma.questions.findMany({
    where: {
      id: {
        in: questionids,
      },
    },
    select: {
      id: true,
      ans: true,
      topic_id:true,
    },
  });

  if (!question_data) throw new Error("question info not found");
  let question_data_map: Map<
    string,
    {
      id: string;
      ans: string[];
      topic_id: string;
    }
  > = new Map();

  question_data.map((data) => {
    question_data_map.set(data.id, data);
  });
  questions.map((question) => {
    let que = question_data_map.get(question.questionid);
    if (!que) throw new Error("question info not match");
    let tempAns: ansFormat = {
      id: String(question.number),
      topic_id: que?.topic_id,
      part: question.part,
      ans: que?.ans,
    };
    ANS.push(tempAns);
  });
  res.json({ success: true, message: "Ans proccessing complete ", data: ANS });
});
export const getExamAns = asyncHandler(async (req: any, res: any) => {
  let examid = req.params.examid;

  // {"id":"number","ans":["2"],"part":"part1","topic":"COMPUTER"}
  type ansFormat = {
    id: string; // number
    ans: string[];
    part: string;
    topic_id: string;
  };

  let ANS: ansFormat[] = [];
  let questions = await prisma.question_map.findMany({
    where: {
      examid: examid,
    },
  });

  if (!questions) throw new Error("Exam invalid or exam doesn't have any ans ");

  let questionids = questions.map((item) => item.questionid);

  let question_data = await prisma.questions.findMany({
    where: {
      id: {
        in: questionids,
      },
    },
    select: {
      id: true,
      ans: true,
      topic_id:true,
    },
  });

  if (!question_data) throw new Error("question info not found");
  let question_data_map: Map<
    string,
    {
      id: string;
      ans: string[];
      topic_id: string;
    }
  > = new Map();

  question_data.map((data) => {
    question_data_map.set(data.id, data);
  });
  questions.map((question) => {
    let que = question_data_map.get(question.questionid);
    if (!que) throw new Error("question info not match");

    let tempAns: ansFormat = {
      id: String(question.number),
      topic_id: que?.topic_id,
      part: question.part,
      ans: que?.ans,
    };
    ANS.push(tempAns);
  });
  res.json({ success: true, message: "Ans proccessing complete ", data: ANS });
});

export const SetUserans = asyncHandler(async (req: any, res: any) => {
  let { userid, examid } = req.query;
  let user_Ans = req.body;
  let isAnsExist = await prisma.userAns.findFirst({
    where: {
      examId: examid,
      userId: userid,
    },
  });
  if (isAnsExist) {
    console.log("ans already added for this user .. -> ", userid);

    return res.json({
      success: true,
      message: "user ans already added into db",
      data: null,
    });
  }
  let responce = await prisma.userAns.create({
    data: {
      ans: user_Ans,
      examId: examid,
      userId: userid,
    },
  });
  res.json({
    success: true,
    message: "user ans added into db",
    data: responce,
  });
});
export const getUserans = asyncHandler(async (req: any, res: any) => {
  let { userid, examid } = req.params;

  let userAns = await prisma.userAns.findFirst({
    where: {
      examId: examid,
      userId: userid,
    },
  });

  // if later we need to add multiple attemp then , change here

  if (!userAns) {
    throw new Error("user ans not exits");
  }
  res.json({ success: true, message: "message", data: userAns });
});
export const getExamPatternid = asyncHandler(async (req: any, res: any) => {
  let examid = req.params.examid;
  let data = await prisma.exam.findFirst({
    where: {
      id: examid,
    },
    select: {
      exam_pattern_id: true,
    },
  });
  if (!data) {
    throw new Error("exam details not found !");
  }
  res.json({ success: true, message: "message", data: data.exam_pattern_id });
});
export const getExamPattern = asyncHandler(async (req: any, res: any) => {
  let exampatternid = req.params.exampatternid;
  
  let exam_pattern = await prisma.exam_pattern.findFirst({
    where: {
      id: exampatternid
    },
  });

  if (!exam_pattern) {
    throw new Error("exam pattern  details not found !");
  }
  return res.json({ success: true, message: "message", data: exam_pattern });
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
export const getQuestionsIds = asyncHandler(async (req: any, res: any) => {
  let topicNormalAnsQuestions =
    await prisma.$queryRaw`SELECT topic, ARRAY_AGG(id) AS ids FROM "Questions"  WHERE is_multiple_ans = false AND status = 'Done' GROUP BY topic; `;
  let topicMultiplaAnsQuestions =
    await prisma.$queryRaw`SELECT topic, ARRAY_AGG(id) AS ids FROM "Questions"  WHERE is_multiple_ans = true AND status = 'Done' GROUP BY topic; `;

  res.json({
    success: true,
    message: "message",
    data: { topicNormalAnsQuestions, topicMultiplaAnsQuestions },
  });
});
export const getQuestionsByids = asyncHandler(async (req: any, res: any) => {
  
  let ids = req.body;

  let responce = await prisma.questions.findMany({
    where: {
      id: { in: ids },
    },
    select: {
      ans: true,
      id: true,
      explanation: true,
      title: true,
      options: true,
      extra: true,
      format: true,
    },
  });
  if (!responce) throw new Error("question  not found for given ids ");

  res.json({ success: true, message: "question info", data: responce });
});
export const getQuestions = asyncHandler(async (req: any, res: any) => {
  let examid = req.body;
  let exam_questions: exam_question_format_type[] = [];

  let question_map_data = await prisma.question_map.findMany({
    where: {
      examid: examid,
    },
  });

  let questionids: string[] = [];
  question_map_data.map((question) => {
    questionids.push(question.questionid);
  });

  if (!questionids)
    throw new Error("given exam doesn't contain any questions ");

  let responce = await prisma.questions.findMany({
    where: {
      id: { in: questionids },
    },
    select: {
      ans: true,
      id: true,
      explanation: true,
      title: true,
      options: true,
      extra: true,
      format: true,
    },
  });

  if (!question_map_data)
    throw new Error("question map is not found for given exam ");

  res.json({ success: true, message: "question info", data: responce });
});
export const getExamQuestionAns = asyncHandler(async (req: any, res: any) => {
  try {
    type ansSchema = {
      ans: string[];
      number: number;
      topic: string;
    };

    let examid = req.query.examid;
    let QuestionIds: string[] = [];
    let QustionAnsFormat: ansSchema[] = [];
    let question_map_data = await prisma.question_map.findMany({
      where: {
        examid: examid,
      },
    });

    if (!question_map_data)
      throw new Error("question map is not found for given exam ");

    question_map_data.map((q) => {
      QuestionIds.push(q.questionid);
    });

    res.json({ success: true, message: "message", data: "data" });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
});
export const addQuestions = asyncHandler(async (req: any, res: any) => {
  let examid = req.params.examid;
  let questions = req.body;
  
  let data = await prisma.question_map.createMany({
    data: questions,
    // skipDuplicates:true
  });
  return res.json({ success: true, message: "questionAdded" });
});
// old
export const getexamAnsseet = asyncHandler(async (req: any, res: any) => {
  let examid = req.params.examid;

  let ansset = await prisma.ansSheet.findFirst({
    where: {
      examId: examid,
    },
    select: {
      ans: true,
    },
  });

  if (!ansset) {
    throw new Error("Ans sheet is not present for give exam");
  }
  res.json({ success: true, message: "anssheet ", data: ansset.ans });
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
export const sendAlluser = async (req: any, res: any) => {
  try {
    let users = await prisma.user.findMany({
      select: {
        telegram: {
          select: { telegramid: true },
        },
        prime: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!users) {
      return res.status(403).json({
        success: false,
        message: "user not found",
      });
    }
    res.json({ success: true, message: "sending users", users: users });
  } catch (error) {
    console.log("Error in bot.controller sendAlluser  --->", error);
    return res.status(400).json({
      success: false,
      message: "server error",
    });
  }
};
export const sendValidchatids = async (req: any, res: any) => {
  try {
    let groupDatas = await prisma.telegramGroupInfo.findMany({
      select: {
        groupid: true,
        groupType: true,
        isBanned: true,
        isPremium: true,
      },
    });

    let formatedValidChatIds: Object[] = [];

    groupDatas.map((groupData) => {
      if (!groupData.isBanned) {
        let tempdata = {
          id: groupData.groupid,
          type: groupData.groupType,
          isPremium: groupData.isPremium,
        };

        formatedValidChatIds.push(tempdata);
      }
    });
    res.json({ success: true, message: "message", data: formatedValidChatIds });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};
export const sendGroupinfo = async (req: any, res: any) => {
  try {
    let group_telegramid = req.query.chatid;

    let groupInfo = await prisma.telegramGroupInfo.findFirst({
      where: {
        groupid:
          typeof group_telegramid !== "string"
            ? String(group_telegramid)
            : group_telegramid,
      },
    });
    res.json({ success: true, message: "message", data: groupInfo });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};
export const isGroupJoinable = async (req: any, res: any) => {
  try {
    let group_telegramid = req.query.chatid;

    let groupInfo = await prisma.telegramGroupInfo.findFirst({
      where: {
        groupid:
          typeof group_telegramid !== "string"
            ? String(group_telegramid)
            : group_telegramid,
      },
    });

    let isjoinable = groupInfo?.isBanned == false ? true : false;
    res.json({ success: true, message: "message", data: isjoinable });
  } catch (error) {
    console.log("Error in bot.controller (in isgroupjoinable)  --->", error);
  }
};
export const AllUserData = async (req: any, res: any) => {
  try {
    let role = req.query.role;

    let users = await prisma.user.findMany({
      where: {
        role: role ?? "User",
      },
      select: {
        telegram: {
          select: {
            telegramid: true,
          },
        },
        prime: {
          select: {
            status: true,
            expiry: true,
          },
        },
      },
    });

    if (!users) {
      return res
        .status(404)
        .json({ success: false, message: "no user found " });
    }
    res.json({ success: true, message: "success ", data: users });
  } catch (error) {
    console.log("Error in bot.controller (in allUserdata) --->", error);
  }
};
export const IsprimeUser = async (req: any, res: any) => {
  try {
    let user_telegramid = req.query.userid;
    let user = await prisma.user.findFirst({
      where: {
        telegram: {
          telegramid: user_telegramid,
        },
      },
      select: {
        prime: {
          select: {
            status: true,
          },
        },
      },
    });
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "user not found",
      });
    }
    let isPrime = user.prime?.status == primeStatus.None ? false : true;

    res.json({ success: true, message: "is user prime ", data: isPrime });
  } catch (error) {
    console.log("Error in IsprimeUser --->", error);
  }
};
export const bot_login = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    let responce = await prisma.user.findFirst({
      where: { email: email, role: UserRole.Bot },
      select: { id: true, password: true },
    });

    if (!responce) {
      throw new Error("bot_login not found");
    }

    let isVerified = veryfyhashPasswordFn(password, responce?.password);

    if (!isVerified) {
      res.status(403).json({ success: false, message: "bot not verified" });
    }
    let newToken = genToken(responce.id);
    res.json({ success: true, message: "successful", data: newToken });
  } catch (error) {
    console.log("Error in bot login --->", error);
  }
};
export const sentQuizData = async (req: any, res: any) => {
  try {
    let data = bot_create_quiz_data_ZodSchema.safeParse(req.body);

    if (!data.success) {
      return res.status(403).json({ success: false, message: "invalid data" });
    }
    let Notifystatus = await QuizeSetupFunction(req.bot_user, data.data);

    if (Notifystatus) {
      res.json({
        success: true,
        message: " quiz setup completed successfully",
      });
    } else {
      res.status(400).json({ success: false, message: "server error" });
    }
  } catch (error) {
    console.log("error in getQuizData in bot controller", error);
  }
};


export const getQuizTopic = async (req: any, res: any) => {
  try {
    let userid = req.query.user;
    // let response = await prisma.botQuizConfig.findFirst({
    //   where: {
    //     User:
    //   }
    // });
    let data: {} | null = null;

    // let topics = await prisma.bo

    
    //   data = {
    //     data: response?.rapidtopic || null,
    //     question_count: response?.question_count || null,
    //   };
    
    return res.json({
      success: true,
      message: " topic sended successfully",
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
};


// admin

export const updateBotWebhook = async (req: any, res: any) => {
  try {
    let data = update_botwebhook_ZodSchema.safeParse(req.body);

    if (!data.success) {
      return res.status(400).json({
        success: false,
        message: "Input format/value invalid",
      });
    }

    let { bot_userid, name, newvalue, type } = data.data;

    let old_webhook_map = {
      webhook: {
        baseurl: "",
        endpoint: {},
      },
    };
    let old_webhook = await prisma.botInfo.findFirst({
      where: {
        botuser_id: bot_userid,
      },
    });

    if (!old_webhook?.webhook) {
      old_webhook_map.webhook = {
        baseurl: "",
        endpoint: {},
      };
    } else {
      old_webhook_map.webhook = old_webhook.webhook as any;
    }

    let newWebhookData = {};

    switch (type) {
      case "endpoint":
        if (!name) {
          return res.status(400).json({
            success: false,
            message: "Name is required",
          });
        }
        newWebhookData = {
          ...old_webhook_map.webhook, // Preserve existing structure
          endpoint: {
            ...old_webhook_map.webhook.endpoint, // Preserve other endpoints
            [name]: newvalue, // Update only the specified endpoint
          },
        };
        break;

      default:
        newWebhookData = {
          ...old_webhook_map.webhook, // Preserve existing structure
          baseurl: newvalue,
        };
    }

    let updated_webhook = await prisma.botInfo.update({
      where: {
        botuser_id: bot_userid,
      },
      data: {
        webhook: newWebhookData,
      },
    });

    res.json({
      success: true,
      message: "Webhook updated successfully",
      data: updated_webhook,
    });
  } catch (error) {
    console.error("Error in updateBotWebhook --->", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const createNewBot = async (req: any, res: any) => {
  try {
    let data = bot_singupZodSchema.safeParse(req.body);

    if (!data.success) {
      return res.status(401).json({
        success: false,
        message: "bot credential format invalid ",
      });
    }

    let { name, email, password, telegramid, bottoken } = data.data;

    let isUserExist = await prisma.user.findUnique({
      where: {
        email: email,
        role: UserRole.Bot,
      },
    });

    if (isUserExist) {
      return res.status(409).json({
        success: false,
        message: "bot already exist , plz log in",
      });
    }
    const bot = await prisma.user.create({
      data: {
        name: name,
        email: email,
        role: UserRole.Bot,
        prime: {
          create: {
            status: primeStatus.None,
          },
        },
        telegram: {
          create: {
            telegramid: telegramid,
            last_update: new Date(),
          },
        },
        blance: {
          create: {
            amount: 1,
            ticket: 1,
            last_update: new Date(),
          },
        },
        verification: {
          create: {},
        },
        password: await hashPasswordFn(password),
      },
    });

    await prisma.progress.create({
      data: {
        userid: bot.id,
      },
    });

    await prisma.botInfo.create({
      data: {
        botuser_id: bot.id,
        token: bottoken,
        webhook: {
          baseurl: "",
          endpoint: {},
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "bot created sucessfully ",
      data: {
        name: bot.name,
        email: bot.email,
      },
    });
  } catch (error) {
    console.log("Error in bot creation --->", error);
  }
};
export const setQuizTopic = async (req: any, res: any) => {
  try {
    let data = req.body;
    // let response = await prisma.botQuizConfig.create({
    //   data: {
    //     quiztopic: data.quiztopic,
    //     rapidtopic: data.rapidtopic,
    //     exam: data.exam,
    //     question_count: data.question_count,
    //   },
    // });

    // if (!response) {
    //   return res.json({
    //     success: false,
    //     message: " topic not set!, error occure",
    //     data: response,
    //   });
    // }
    return res.json({ success: true, message: " topic set successfully" });
  } catch (error) {
    console.log(error);
  }
};
export const addbotToken = async (req: any, res: any) => {
  try {
    let token = req.body.token;
    let botuserID = req.body.id;
    // set zod validation

    token = await hashPasswordFn(token);

    //  console.log("token" ,token);

    let response = await prisma.botInfo.create({
      data: {
        token: token,
        botuser_id: botuserID,
      },
    });
    //  console.log("responce", response);

    if (response) {
      res.json({ success: true, message: "bot token set successfully" });
    }
  } catch (error) {
    console.log(error);
  }
};
