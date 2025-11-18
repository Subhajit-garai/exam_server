import { diffcultlevel, Prisma } from  "@repo/prisma/client";
import prisma from "@repo/db/index";
import {
  QuestionFilterDataFetchZodSchema,
  questionInputZodSchema,
  questionUpdateZodSchema,
} from "../zod/question.zod";
import { asyncHandler } from "@repo/lib/helper/asyncHandler";

export const updateQuestion = async (req: any, res: any) => {
  try {
    let user = await prisma.user.findUnique({
      where: {
        id: req.user,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    console.log("req.body", req.body);

    let data = questionUpdateZodSchema.safeParse(req.body);
    if (!data.success) {
      console.log("data.error", data.error);

      return res.status(401).json({
        success: false,
        message: "inpute format/value invalid ",
      });
    }
    // let {
    //   id,
    //   title,
    //   options,
    //   ans,
    //   formate,
    //   category,
    //   topic,
    //   difficulty,
    //   explanation,
    // } = data.data;

    let question = await prisma.questions.update({
      where: {
        id: data.data.id,
      },
      data: {
        ...data.data,
        ...(data.data.extra ? { extra: data.data.extra } : undefined),
        ...(data.data.extra === null
          ? { extra: Prisma.JsonNull }
          : { extra: data.data.extra }),
      },
    });

    if (!question) {
      return res.status(400).json({
        message: "Question not updated ",
      });
    }

    res.status(200).json({
      message: "Question updation successfull",
    });
  } catch (error) {
    console.log("error : ", error);

    res.status(500).json({
      error: error,
      message: "surver error",
    });
  }
};

export const GetQuestionExplanation = async (req: any, res: any) => {
  try {
    let questionid = req.query.questionid;

    let data = await prisma.questions.findFirst({
      where: { id: questionid },
      select: {
        explanation: true,
        links: true,
      },
    });
    res.json({ success: true, message: "Question Explanation", data: data });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const checkQuestion = async (req: any, res: any) => {
  try {
    let { title } = req.body;

    let responce = await prisma.questions.findMany({
      where: {
        title: {
          contains: title,
        },
      },
    });

    if (responce.length > 0) {
      return res.status(200).json({
        message: "Question already exist",
        data: responce,
      });
    }
    return res.status(200).json({
      message: "Question not exist",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Error in question check",
    });
  }
};
export const createQuestion = async (req: any, res: any) => {
  try {
    let user = await prisma.user.findUnique({
      where: {
        id: req.user,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      // console.log("passs", user);
      throw new Error("User not found");
    }
    let data = questionInputZodSchema.safeParse(req.body);

    if (!data.success) {
      return res.status(401).json({
        success: false,
        message: "inpute format/value invalid ",
      });
    }
    let {
      Title,
      options,
      ans,
      format,
      category,
      topic_id,
      difficulty,
      isMultiple,
      Explanation,
      extra,
      subject_id,
      status,
      history,
      links,
    } = data.data;

    let question = await prisma.questions.create({
      data: {
        title: Title,
        options: options,
        extra: extra,
        ans: ans,
        format: format,
        category: category,

        // temp data
        old_sub_topic:"",
        old_topic:"",

        topic_id: topic_id, // change to sub_topic
        subject_id: subject_id,
        ...(status ? { status: status } : { status: "Processing" }),
        ...(history ? { history: history } : { history: [""] }),
        ...(links ? { links: links } : { links: [""] }),
        explanation: Explanation,
        is_multiple_ans: isMultiple,
        difficulty: difficulty as diffcultlevel,
        created_by: user.id,
      },
    });

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question not created ",
      });
    }

    res.status(200).json({
      success: true,
      message: "Question creation successfull",
    });
  } catch (error) {
    console.log("error : ", error);

    res.status(500).json({
      success: false,
      message: "surver error",
    });
  }
};

export const getQuestion = async (req: any, res: any) => {
  try {
    let QuestionId = req.params.id;
    let responce = await prisma.questions.findUnique({
      where: {
        id: QuestionId,
      },
      select: {
        title: true,
        options: true,
      },
    });

    if (!responce) {
      return res.status(400).json({
        message: "questions not found",
      });
    }

    res.status(200).json({
      success: true,
      data: responce,
    });
  } catch (error) {
    res.status(500).json({
      message: "surver error",
    });
  }
};

export const getQuestionalldatabyID = async (req: any, res: any) => {
  try {
    let QuestionId = req.params.id;
    let responce = await prisma.questions.findUnique({
      where: {
        id: QuestionId,
      },
    });

    if (!responce) {
      return res.status(400).json({
        message: "questions not found",
      });
    }

    res.status(200).json({
      success: true,
      data: responce,
    });
  } catch (error) {
    res.status(500).json({
      message: "surver error",
    });
  }
};

export const getAllQuestions = async (req: any, res: any) => {
  try {
    let body = QuestionFilterDataFetchZodSchema.safeParse(req.query);
    if (!body.success) {
      return res.status(401).json({
        success: false,
        message: "user credential format invalid ",
      });
    }
    let {
      category,
      topic,
      difficulty,
      formate,
      status,
      id,
      title,
      page,
      ismultipleans,
      links,
      history,
    } = body.data;

    const pageNumber = page ? parseInt(page) : 1;
    const questionsPerPage = 16;
    let responce;

    let filtertitle: any;
    if (title?.trim()) {
      filtertitle = {
        contains: title.trim(),
        mode: "insensitive", // Case-insensitive search
      };
    }
    let Formatedfilter: any = id
      ? { id: id }
      : {
          ...(category && { category: category.toUpperCase() }),
          ...(topic && { topic: topic.toUpperCase() }),
          ...(difficulty && { difficulty: difficulty }),
          ...(formate && { formate: formate }),
          ...(status && { status: status }),
          ...(filtertitle && { title: filtertitle }),
          ...(ismultipleans && { is_multiple_ans: ismultipleans }),
          ...(links && {
            links: {
              has: links,
            },
          }), // array
          ...(history && {
            history: {
              has: history,
            },
          }), // array
        };

    if (id) {
      responce = await prisma.questions.findMany({
        where: Formatedfilter,
        // skip: (pageNumber - 1) * questionsPerPage,
        // take: questionsPerPage,
        // orderBy: { id: "asc" },
      });
    } else {
      responce = await prisma.questions.findMany({
        where: Formatedfilter,
        skip: (pageNumber - 1) * questionsPerPage,
        take: questionsPerPage,
        orderBy: { id: "asc" },
      });
    }

    if (!responce) {
      return res.status(400).json({
        message: "questions not found",
      });
    }

    const total = await prisma.questions.count({
      where: Formatedfilter,
    });

    res.status(200).json({
      success: true,
      data: { questions: responce, total: total, currentPage: pageNumber },
    });
  } catch (error) {
    console.log("error -> ", error);

    res.status(500).json({
      message: "surver error",
    });
  }
};

export const backupQuestion = async (req: any, res: any) => {
  try {
    let responce = await prisma.questions.findMany({});
    const total = await prisma.questions.count({});

    res.status(200).json({
      success: true,
      data: { questions: responce, total: total },
    });
  } catch (error) {
    console.log("error in backupQuestion ", error);

    res.status(500).json({
      success: false,
      message: "surver error",
    });
  }
};
