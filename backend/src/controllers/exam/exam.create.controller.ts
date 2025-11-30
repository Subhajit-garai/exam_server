import { syllabusType } from "@repo/prisma/client.js";
import prisma from "@repo/db/index.js";
import {
  ExamCreateInputeSchema,
  ExampatternInputZodSchema,
} from "../../zod/user.zod.js";
import { examManager } from "@repo/lib/manager/examManager.js";

import { asyncHandler } from "@repo/lib/helper/asyncHandler.js";
import {
  create_targated_exam_year_zodSchemea,
  create_targated_exam_zodSchemea,
} from "../../zod/exam.zod.js";
import { ZodDataSafeParse } from "@repo/lib/ZodTypeChecker.js";
import { ConvertInSlug } from "@/lib/slug.js";

const em = examManager.getInstance();

export const CreateNewExamPattern = asyncHandler(async (req: any, res: any) => {
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
    examyear,
    syllabus,
  } = data.data;

  let user = req.user;

  let syllabusData;

  if (checkbox) {
    if (!syllabus) throw Error("syllabus not found ");

    let examYearData = await prisma.examYear.findFirst({
      where: {
        targetExam: {
          name: examname,
        },
        year: parseInt(examyear),
      },
    });

    if (!examYearData) throw Error("examYearData not found ");

    syllabusData = await prisma.syllabus.findFirst({
      where: {
        exam_year_id: examYearData.id,
        title: syllabus,
      },
    });

    if (!syllabusData) throw Error("syllabusdata not found ");
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
      checkbox,
      marks_values,
      neg_values,
      syllabus: checkbox ? syllabusType.Syllabus : syllabusType.Generic,
      syllabusid: checkbox ? syllabusData?.id : null,
      created_by: user,
    },
  });

  if (!response) throw Error(" exam patten not created ");

  return res.json({
    success: true,
    message: "New Exam Pattern Created Successful",
  });
});

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

export const CreateExam = asyncHandler(async (req: any, res: any) => {
  let data = ExamCreateInputeSchema.safeParse(req.body);

  let user = req.user;

  if (!data.success) {
    throw ZodDataSafeParse(data, true);
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
    type: "CREATE_EXAM",
    id: id,
    payload: {
      examid: id,
      userid: user,
      examtype: response.examtype,
    },
    variant: response.examtype,
    category: "JECA",
  });

  // call back to user
  if (Notifystatus) {
    console.log(`${examtype} Created ....`);
  }

  // end

  res.json({
    success: true,
    message: `New ${examtype}  Created Successful`,
  });
});
