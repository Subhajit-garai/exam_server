import prisma from "@repo/db/index";
import { asyncHandler } from "@repo/lib/helper/asyncHandler";
import { debuglog } from "@repo/lib/helper/debugLog";
import { ZodDataSafeParse } from "@repo/lib/ZodTypeChecker";
import {
  mockQuestionAddZodSchema,
  mockQuestionSetZodSchema,
} from "../zod/question.zod";

export const test = async (req: any, res: any) => {
  try {
    res.json({ success: true, message: "message", data: "data" });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const getAvalibleMockSets = async (req: any, res: any) => {
  try {
    let exam = req.query.exam.toUpperCase();

    let response = await prisma.mock_questions_set.findMany({
      where: {
        exam: exam,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!response) {
      return res
        .status(400)
        .json({ success: false, message: `Can not find any mock sets` });
    }

    res.json({
      success: true,
      message: `alalible Exam's mock sets`,
      mocksets: response,
    });
  } catch (error) {
    console.log("Error in question controller (getAvalibleMockSets)", error);
  }
};

export const AddQuestionIntoMockQuestionSet = asyncHandler(
  async (req: any, res: any) => {
    // let questionid = req.query.questionid;
    // let part = req.query.part;
    // let mockid = req.query.id; // mock set id

    let parssedData = mockQuestionAddZodSchema.safeParse(req.query);

    if (!parssedData.success) {
      throw ZodDataSafeParse(parssedData);
    }

    let { part, questionid, id: mockid } = parssedData.data;

    console.log("Question mockset id ---add ", mockid);

    let mockset = await prisma.mock_questions_set.findFirst({
      where: {
        id: mockid,
      },
    });

    if (!mockset) {
      throw new Error("mock set  not exist");
    }

    // let Questions: any = mockset.questions;

    // if (Questions) {
    //   if (Questions.hasOwnProperty(part)) {
    //     Questions[part].push(questionid);
    //   } else {
    //     Questions[part] = [];
    //     Questions[part].push(questionid);
    //   }
    // } else {
    //   Questions = {};
    //   Questions[part] = [];
    //   Questions[part].push(questionid);
    // }

    let isQuestionExits = await prisma.mock_question_map.findFirst({
      where: {
        questionid: questionid,
        mockid: mockid,
      },
    });

    if (isQuestionExits)
      return res.json({
        success: true,
        message: "question already added in this mock question set ",
        data: questionid,
      });

    let addedNewQuestion = await prisma.mock_question_map.create({
      data: {
        number: Math.random() * 10000,
        questionid: questionid,
        part: part,
        mockid: mockid,
      },
    });

    if (!addedNewQuestion)
      throw new Error("error while adding question in mock question set ");

    let status = await prisma.mock_questions_set.update({
      where: {
        id: mockid,
      },
      data: {
        // questions: Questions,
        status: "Updated",
      },
    });

    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: `mock set  not status not updated ` });
    }
    return res.json({
      success: true,
      message: "question  added successful",
      data: questionid,
    });
  }
);

// i can set this in worker , because it may take move time
export const RemoveQuestionFromMockQuestionSet = asyncHandler(
  async (req: any, res: any) => {
    let questionid = req.query.questionid;
    let mockid = req.query.id; // mock set id
    let part = req.query.part;

    console.log("Question mockset id ---remove ", mockid);

    let mockset = await prisma.mock_questions_set.findFirst({
      where: {
        id: mockid,
      },
    });

    if (!mockset) {
      throw new Error("mock set  not exist");
    }

    // let Questions: any = mockset.questions;
    // if (Questions) {
    //   if (Questions.hasOwnProperty(part)) {
    //     // removing
    //     Questions[part] = Questions[part].filter(
    //       (qId: any) => qId !== questionid
    //     );
    //   }
    // }

    let isQuestionExits = await prisma.mock_question_map.findFirst({
      where: {
        questionid: questionid,
        mockid: mockid,
      },
    });

    if (!isQuestionExits)
      throw new Error(
        "question not  exits  in this mock question set . deletion can't be perform"
      );

    let deleteQuestion = await prisma.mock_question_map.delete({
      where: {
        mockid_questionid_part: {
          mockid: mockid,
          questionid: questionid,
          part: part,
        },
      },
    });

    if (!deleteQuestion)
      throw new Error("error while removing  question from mock question set ");

    let status = await prisma.mock_questions_set.update({
      where: {
        id: mockid,
      },
      data: {
        // questions: Questions,
        status: "Updated",
      },
    });

    if (!status) {
      throw new Error("mock set question not setted");
    }
    return res.json({
      success: true,
      message: "question  removed  successful from mock set  ",
      data: "data",
    });
  }
);

export const getSyllabusByMockQuestionSetid = async (req: any, res: any) => {
  try {
    let MocksetId = req.query.MocksetId;
    // cmb3impge0000bu64m3hq99bt

    if (!MocksetId)
      return res
        .status(400)
        .json({ success: false, message: `Mockset id  not exist` });

    let exam_patten = await prisma.mock_questions_set.findFirst({
      where: {
        id: MocksetId,
      },
      select: {
        pattern: true,
      },
    });

    if (!exam_patten) {
      return res
        .status(400)
        .json({ success: false, message: `patten  not found` });
    }

    let response = await prisma.exam_pattern.findFirst({
      where: {
        title: exam_patten?.pattern,
      },
      select: {
        topics: true,
      },
    });

    if (!response) {
      return res
        .status(400)
        .json({ success: false, message: `topics  not exist` });
    }

    let topics = response?.topics;

    res.json({
      success: true,
      message: `topics data`,
      topics: topics,
    });
  } catch (error) {
    console.log("Error in getsyllabus", error);
  }
};
export const get_mock_set_questions = asyncHandler(
  async (req: any, res: any) => {
    let mockid = req.query.mockid;
    let data = await prisma.mock_questions_set.findFirst({
      where: {
        id: mockid,
      },
      select: {
        id: true,
      },
    });
    if (!data) {
      throw new Error(" mock set not found ");
    }

    let questions  = await prisma.mock_question_map.findMany({
      where:{
        mockid:mockid
      }
    })

    if (!questions) {
      throw new Error(" questions set not found ");
    }

    return res.json({ success: true, message: " questions for Mock set", data: questions });
  }
);

export const get_mock_question_set_by_id = async (req: any, res: any) => {
  try {
    let id = req.query.id;
    let data = await prisma.mock_questions_set.findFirst({
      where: {
        id: id,
      },
    });
    if (!data) {
      return res.status(400).json({
        message: " mock set not found ",
      });
    }

    res.json({ success: true, message: " sended Mock set", data: data });
  } catch (error) {
    console.log("Error in metrix --->", error);
    return res.status(400).json({
      message: "mock set not found ",
    });
  }
};
export const get_all_mock_question_set = async (req: any, res: any) => {
  try {
    let data = await prisma.mock_questions_set.findMany({});
    if (!data) {
      return res.status(400).json({
        message: " mock set not found ",
      });
    }

    res.json({ success: true, message: " sended Mock sets", data: data });
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
    let patterInfo = await prisma.exam_pattern.findFirst({
      where: {
        title: data.data.pattern,
      },
      select: {
        total_questions: true,
      },
    });

    if (!patterInfo) {
      return res.status(400).json({
        message: " mock set not created ",
      });
    }
    let responce = await prisma.mock_questions_set.create({
      data: {
        name: data.data.name,
        exam: data.data.exam,
        category: data.data.category,
        description: data.data.description,
        pattern: data.data.pattern,
        total_questions: patterInfo?.total_questions,
      },
    });

    if (!responce) {
      return res.status(400).json({
        message: " mock set not created ",
      });
    }

    res.json({ success: true, message: "message", data: responce });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};
