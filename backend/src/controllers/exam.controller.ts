import { asyncHandler } from "@repo/lib/helper/asyncHandler.js";
import {
  updare_targated_exam_year_zodSchemea,
} from "../zod/exam.zod.js";
import { ZodDataSafeParse } from "@repo/lib/ZodTypeChecker.js";
import { SubmitedQuestionAnsZodSchema } from "../zod/question.zod.js";
import { ExamService } from "../services/exam.service.js";

const examService = new ExamService();

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
    let response = await examService.deletexams();

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

    let updated_target_exam_year = await examService.update_targeted_exam_year(processedData.data);

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

    let data = await examService.getUserAnsSetOfAnExam(userid, examid);

    res.json({ success: true, message: "message", data: data });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

export const getUserMetaDataforAnExam = async (req: any, res: any) => {
  try {
    let examid = req.query.examid;
    let userid = req.user;

    let data = await examService.getUserMetaDataforAnExam(userid, examid);

    res.json({ success: true, message: "message", data: data });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

// working here

//1.0
export const gettokenSystem = async (req: any, res: any) => {
  try {
    let type = req.query.type;
    let data = await examService.gettokenSystem(req.user, type);

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

  let Category = await examService.getCategory();

  res.json({
    success: true,
    message: ` available Categorys `,
    data: Category,
  });

});

export const fetch_targeted_exam_by_id = asyncHandler(
  async (req: any, res: any) => {
    let { id } = req.query;
    let target_exam = await examService.fetch_targeted_exam_by_id(id);

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
    let data = await examService.ExamAttemptQuestionMetaData(userid, examid);
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

  let status = await examService.submitAnswerhandler(userid, examid, number, part, ans, ismultiple);

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

  let status = await examService.finalsubmitExam(userid, examid);
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

  let question = await examService.joinedExamData(userid, examid, type, number, part);

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

    try {
      await examService.examJoinRequestProcess(userid, examid);

      return res.json({
        success: true,
        message: `Exam setup Successfull ...`,
        data: "no data",
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

export const getExamYearInfo = asyncHandler(async (req: any, res: any) => {
  let { examname, id } = req.query;

  let exam_year = await examService.getExamYearInfo(examname, id);

  return res.json({
    success: true,
    message: `Exam Submited Successfully ...`,
    data: exam_year,
  });
});

export const getExamsbyid = asyncHandler(async (req: any, res: any) => {
  let response = await examService.getExamsbyid(req.query.id);

  return res.json({
    success: true,
    message: `${response.length < 1 ? " No Exams found" : "All  Exams "} `,
    data: response,
  });
});

export const getExams = asyncHandler(async (req: any, res: any) => {
  let type = req.query.type;
  let page = req.query.page ?? 1;
  let limit = req.query.limit
    ? typeof req.query.limit === "string"
      ? parseInt(req.query.limit)
      : req.query.limit
    : 10;
  let order: "desc" | "asc" = req.query.order === "asc" ? "asc" : "desc";

  const pageNumber = page ? parseInt(page) : 1;

  const { exams, total, currentPage } = await examService.getExams(
    req.user,
    type,
    pageNumber,
    limit,
    order,
    req.query.starttime,
    req.query.endtime
  );

  res.json({
    success: true,
    message: `${exams.length < 1 ? " No Exams found" : `${exams.length} All  Exams `
      } `,
    data: { exams: exams, total: total, currentPage: currentPage },
  });
});

export const getAvalibletargetExamAll = asyncHandler(
  async (req: any, res: any) => {
    try {
      let AvalibleExam = await examService.getAvalibletargetExamAll();

      return res.json({
        success: true,
        message: ` avalible Exam  names`,
        data: AvalibleExam,
      });
    } catch (error: any) {
      throw error;
    }
  }
);
export const getAvalibletargetExam = asyncHandler(
  async (req: any, res: any) => {
    let category = req.query.category.toUpperCase();

    try {
      let AvalibleExam = await examService.getAvalibletargetExam(category);

      return res.json({
        success: true,
        message: ` avalible Exam  names`,
        data: AvalibleExam,
      });
    } catch (error: any) {
      throw error;
    }
  }
);

export const getAvalibleExamPattern = asyncHandler(
  async (req: any, res: any) => {
    let exam = req.query.exam.toUpperCase();
    let user = req.user;

    try {
      let response = await examService.getAvalibleExamPattern(exam, user);

      res.json({
        success: true,
        message: `alalible Exam patterns`,
        data: response,
      });
    } catch (error: any) {
      return res
        .status(400)
        .json({ success: false, message: `Can not find any exampattern` });
    }
  }
);
