import { diffcultlevel } from "@prisma/client";
import prisma from "../../db/index";
import {
  mockQuestionSetZodSchema,
  questionInputZodSchema,
  QuestionProssingDataFetchZodSchema,
  questionUpdateZodSchema,
} from "../zod/question.zod";

export const test = async (req: any, res: any) => {
  try {
    res.json({ success: true, message: "message", data: "data" });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};
export const Create_Mock_question_set = async (req: any, res: any) => {
  try {
    let data = mockQuestionSetZodSchema.safeParse(req.body);
    if (!data.success) {
      console.log("data.error", data.error);

      return res.status(401).json({
        success: false,
        message: "inpute format/value invalid ",
      });
    }

    console.log("req.body", req.body);
    console.log("data", data.data);

    res.json({ success: true, message: "message", data: "data" });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

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

    console.log("date", Date.now().toString());

    let question = await prisma.questions.update({
      where: {
        id: req.params.id,
      },
      data: {
        ...data.data,
        ...(data.data.extra ? { extra: data.data.extra } : {}),
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

export const QuestionProssingDataFetch = async (req: any, res: any) => {
  try {
    let body = QuestionProssingDataFetchZodSchema.safeParse(req.body);

    if (!body.success) {
      return res.status(401).json({
        success: false,
        message: "user credential format invalid ",
      });
    }
    let { category, topic, difficulty, formate, status, id } = body.data;

    let data = await prisma.questions.findMany({
      where: {
        ...(id != "none" && { id: id }),
        ...(formate && { formate: formate }),
        ...(category && { category: category.toUpperCase() }),
        ...(topic && { topic: topic.toUpperCase() }),
        ...(difficulty && { difficulty: difficulty }),
        ...(status && { status: status }),
      },
      take: 1,
    });
    if (data) {
      res.json({ success: true, message: "message", data: data });
    }
  } catch (error) {
    console.log("Error in metrix --->", error);
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
      formate,
      category,
      topic,
      difficulty,
      Explanation,
    } = data.data;

    // let Ans = Array.isArray(ans)
    //   ? [...ans.filter((a: string) => a.replace("option", ""))]
    //   : [ans.replace("option", "")];

    let question = await prisma.questions.create({
      data: {
        title: Title,
        explanation: Explanation,
        options: options,
        ans: ans,
        formate: formate,
        category: category,
        topic: topic,
        difficulty: difficulty as diffcultlevel,
        created_by: user.id,
      },
    });

    if (!question) {
      return res.status(400).json({
        message: "Question not created ",
      });
    }

    res.status(200).json({
      message: "Question creation successfull",
    });
  } catch (error) {
    console.log("error : ", error);

    res.status(500).json({
      error: error,
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
    let query = req.query;

    const pageNumber = parseInt(query.page) || 1;
    const questionsPerPage = 10;

    let responce = await prisma.questions.findMany({
      where: {
        ...(query.category && { category: query.category.toUpperCase() }),
        ...(query.topic && { topic: query.topic.toUpperCase() }),
        ...(query.difficulty && { difficulty: query.difficulty }),
        ...(query.formate && { formate: query.formate }),
        ...(query.status && { status: query.status }),
      },
      skip: (pageNumber - 1) * questionsPerPage,
      take: questionsPerPage,
      orderBy: { id: "asc" },
    });

    if (!responce) {
      return res.status(400).json({
        message: "questions not found",
      });
    }

    const total = await prisma.questions.count({
      where: {
        ...(query.category && { category: query.category.toUpperCase() }),
        ...(query.topic && { topic: query.topic.toUpperCase() }),
        ...(query.difficulty && { difficulty: query.difficulty }),
        ...(query.formate && { formate: query.formate }),
        ...(query.status && { status: query.status }),
      },
    });

    res.status(200).json({
      success: true,
      data: {questions: responce, total: total },
    });
  } catch (error) {
    res.status(500).json({
      message: "surver error",
    });
  }
};
