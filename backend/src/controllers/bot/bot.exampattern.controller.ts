import { asyncHandler } from "@/lib/helper/asyncHandler";
import prisma from "@repo/db/index";

export const updatExamCrationStatus = asyncHandler(
  async (req: any, res: any) => {
    let examid = req.params.examid;

    if (!examid) throw Error("examid required");
    let isExamExist = await prisma.exam.findFirst({
      where: {
        id: examid,
      },
      select: {
        exam_pattern: {
          select: {
            total_questions: true,
          },
        },
      },
    });

    if (!isExamExist) throw new Error("exam notfound ");

    let Question_data = await prisma.question_map.count({
      where: {
        examid: examid,
      },
    });

    if (!Question_data) throw new Error("exam Question data info not found ");
    let exam_total_question_count: number = 0;
    isExamExist.exam_pattern.total_questions.map((num) => {
      exam_total_question_count = exam_total_question_count + num;
    });

    console.log("exam_total_question_count", exam_total_question_count);
    console.log("Question_data", Question_data);

    if (exam_total_question_count == Question_data) {
      console.log("exam checked ....");
      console.log("updating creation status");

      await prisma.exam.update({
        where: {
          id: examid,
        },
        data: {
          creationstatus: "Done",
        },
      });
    }

    return res.json({
      success: true,
      message: "exam creation status updated  ",
      data: "no data",
    });
  }
);
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
  return res.json({
    success: true,
    message: "message",
    data: data.exam_pattern_id,
  });
});

export const getExamPattern = asyncHandler(async (req: any, res: any) => {
  let exampatternid = req.params.exampatternid;

  let exam_pattern = await prisma.exam_pattern.findFirst({
    where: {
      id: exampatternid,
    },
  });

  if (!exam_pattern) {
    throw new Error("exam pattern  details not found !");
  }
  return res.json({ success: true, message: "message", data: exam_pattern });
});
