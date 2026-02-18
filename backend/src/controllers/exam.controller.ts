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
// export const deletexams = async (req: any, res: any) => {
//   try {
//     let response = await examService.deletexams();
// 
//     res.json({
//       success: true,
//       message: `  Exam  removed`,
//       for: response,
//     });
//   } catch (error) {
//     console.log("Error in exam controller", error);
//   }
// };

// done

export const updateTargetedExamYear = asyncHandler(
  async (req: any, res: any) => {
    let processedData = updare_targated_exam_year_zodSchemea.safeParse(
      req.body
    );

    if (!processedData.success) {
      throw ZodDataSafeParse(processedData);
    }

    let updated_target_exam_year = await examService.updateTargetedExamYear(processedData.data);

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

export const getUserMetaDataForExam = async (req: any, res: any) => {
  try {
    let examid = req.query.examid;
    let userid = req.user;

    let data = await examService.getUserMetaDataForExam(userid, examid);

    res.json({ success: true, message: "message", data: data });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
};

// working here

//1.0
export const getTokenSystem = async (req: any, res: any) => {
  try {
    let type = req.query.type;
    let data = await examService.getTokenSystem(req.user, type);

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
export const getCategoryName = asyncHandler(async (req: any, res: any) => {

  let Category = await examService.getCategoryName();

  res.json({
    success: true,
    message: ` available Categorys `,
    data: Category,
  });

});


export const fetchTargetedExamById = asyncHandler(
  async (req: any, res: any) => {
    let { id } = req.query;
    let target_exam = await examService.fetchTargetedExamById(id);

    return res.json({
      success: true,
      message: "targated_exam created successfuly",
      data: target_exam.name,
    });
  }
);

export const getExamAttemptQuestionMetaData = asyncHandler(
  async (req: any, res: any) => {
    let examid = req.query.examid;
    let userid = req.user;
    let data = await examService.getExamAttemptQuestionMetaData(userid, examid);
    res.json({ success: true, message: "message", data: data });
  }
);

export const submitAnswerHandler = asyncHandler(async (req: any, res: any) => {
  let data = SubmitedQuestionAnsZodSchema.safeParse(req.query);

  if (!data.success) {
    throw ZodDataSafeParse(data, true);
  }

  let { examid, number, part, ans, ismultiple } = data.data;
  let userid = req.user;

  let status = await examService.submitAnswerHandler(userid, examid, number, part, ans, ismultiple);

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

export const finalSubmitExam = asyncHandler(async (req: any, res: any) => {
  let examid = req.query.examid;
  let userid = req.user;

  let status = await examService.finalSubmitExam(userid, examid);
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

export const getJoinedExamData = asyncHandler(async (req: any, res: any) => {
  let examid = req.query.examid;
  let type = req.query.type;
  let number = req.query.number;
  let part = req.query.part;
  let userid = req.user;

  console.log("--> ", req.query);


  let question = await examService.getJoinedExamData(userid, examid, type, number, part);

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
    await examService.examJoinRequestProcess(userid, examid);

    return res.json({
      success: true,
      message: `Exam setup Successfull ...`,
      data: "no data",
    });
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

export const getExamsById = asyncHandler(async (req: any, res: any) => {
  let response = await examService.getExamsById(req.query.id);

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

export const getAvailableTargetExamAll = asyncHandler(
  async (req: any, res: any) => {
    try {
      let availableExam = await examService.getAvailableTargetExamAll();

      return res.json({
        success: true,
        message: ` available Exam  names`,
        data: availableExam,
      });
    } catch (error: any) {
      throw error;
    }
  }
);
export const getAvailableTargetExam = asyncHandler(
  async (req: any, res: any) => {
    let category = req.query.category;
    try {
      let availableExam = await examService.getAvailableTargetExam(category);

      return res.json({
        success: true,
        message: ` available Exam  names`,
        data: availableExam,
      });
    } catch (error: any) {
      throw error;
    }
  }
);

export const getAvailableExamPattern = asyncHandler(
  async (req: any, res: any) => {
    let exam = req.query.exam.toUpperCase();
    let user = req.user;

    let response = await examService.getAvailableExamPattern(exam, user);

    res.json({
      success: true,
      message: `available Exam patterns`,
      data: response,
    });
  }
);

export const getExamPatternById = asyncHandler(async (req: any, res: any) => {
  let { id } = req.params;
  let response = await examService.getExamPatternById(id);
  res.json({
    success: true,
    message: "Exam Pattern fetched successfully",
    data: response,
  });
});

export const updateExamPattern = asyncHandler(async (req: any, res: any) => {
  let { id } = req.body;
  let response = await examService.updateExamPattern(req.body, req.user);
  res.json({
    success: true,
    message: "Exam Pattern updated successfully",
    data: response,
  });
});

export const deleteExamPattern = asyncHandler(async (req: any, res: any) => {
  let { id } = req.params;
  let response = await examService.deleteExamPattern(id);
  res.json({
    success: true,
    message: "Exam Pattern deleted successfully",
    data: response,
  });
});
