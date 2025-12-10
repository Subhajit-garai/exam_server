import {
  QuestionFilterDataFetchZodSchema,
  questionInputZodSchema,
  questionUpdateZodSchema,
} from "../zod/question.zod.js";
import { QuestionService } from "../services/question.service.js";
import { ZodDataSafeParse } from "@/lib/ZodTypeChecker.js";
import { asyncHandler } from "@/lib/helper/asyncHandler.js";

const questionService = new QuestionService();

export const updateQuestion = async (req: any, res: any) => {
  try {
    console.log("req.body", req.body);

    let data = questionUpdateZodSchema.safeParse(req.body);
    if (!data.success) {
      console.log("data.error", data.error);

      return res.status(401).json({
        success: false,
        message: "inpute format/value invalid ",
      });
    }

    let question = await questionService.updateQuestion(req.user, data.data);

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

    let data = await questionService.getQuestionExplanation(questionid);
    res.json({ success: true, message: "Question Explanation", data: data });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const checkQuestion = async (req: any, res: any) => {
  try {
    let { title } = req.body;

    let responce = await questionService.checkQuestion(title);

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
    let data = questionInputZodSchema.safeParse(req.body);

    if (!data.success) {
      return res.status(401).json({
        success: false,
        message: "inpute format/value invalid ",
      });
    }

    let question = await questionService.createQuestion(req.user, data.data);

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
    let responce = await questionService.getQuestion(QuestionId);

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
    let responce = await questionService.getQuestionAllDataById(QuestionId);

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

export const getAllQuestions = asyncHandler(async (req: any, res: any) => {
  let body = QuestionFilterDataFetchZodSchema.safeParse(req.query);


  if (!body.success) {
    throw ZodDataSafeParse(body)
  }

  const pageNumber = body.data.page ? parseInt(body.data.page) : 1;

  const { questions, total, currentPage } = await questionService.getAllQuestions(body.data, pageNumber);

  if (!questions) {
    return res.status(400).json({
      message: "questions not found",
    });
  }

  res.status(200).json({
    success: true,
    data: { questions: questions, total: total, currentPage: currentPage },
  });

})

export const backupQuestion = async (req: any, res: any) => {
  try {
    const { questions, total } = await questionService.backupQuestion();

    res.status(200).json({
      success: true,
      data: { questions: questions, total: total },
    });
  } catch (error) {
    console.log("error in backupQuestion ", error);

    res.status(500).json({
      success: false,
      message: "surver error",
    });
  }
};
