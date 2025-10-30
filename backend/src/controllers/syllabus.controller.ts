import { asyncHandler } from "@/lib/helper/asyncHandler";
import prisma from "@/db";
import {
  AddSubjectInputZodSchema,
  AddTopicInputZodSchema,
  SyllabusInputZodSchema,
} from "@/zod/syllabus.zod";
import { ZodDataSafeParse } from "@/lib/ZodTypeChecker";

type fomatedSubject_type = {
  subject: string;
  weightage: number | null;
  topics: string[];
};
type formatedSyllabus_type = {
  id: string;
  subjects: fomatedSubject_type[];
  created_at: string;
  exam: string | null | undefined;
  examYear: number | null | undefined;
};

export const text = asyncHandler(async (req: any, res: any) => {});

export const CreateSyllabus = async (req: any, res: any) => {
  try {
    let data = SyllabusInputZodSchema.safeParse(req.body);

    if (!data.success) {
      return res.status(401).json({
        success: false,
        message: "given credential/input   invalid ",
      });
    }

    // syllabus architecture change need update

    let response = await prisma.syllabus.create({
      data: {
        ...data.data,
      },
    });

    if (!response) {
      return res.status(400).json({
        success: false,
        message: `Syllabus  not created ,`,
      });
    }

    // let syllabus = response.topics;

    res.json({
      success: true,
      message: `Syllabus created  `,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: `Syllabus not created , Exam Name Already exist ,`,
    });
  }
};

export const getSyllabusByid = async (req: any, res: any) => {
  try {
    let syllabusid = req.query.syllabusid;

    let response = await prisma.syllabus.findFirst({
      where: {
        id: syllabusid,
      },
    });

    if (!response) {
      return res
        .status(400)
        .json({ success: false, message: `Syllabus  not exist` });
    }

    let syllabus: any = []; //  response?.topics;

    res.json({
      success: true,
      message: `Syllabus data`,
      syllabus: syllabus,
    });
  } catch (error) {
    console.log("Error in getsyllabus", error);
  }
};

export const fetchAllsyllabus = asyncHandler(async (req: any, res: any) => {
  // here i can get exam from user

  let response = await prisma.syllabus.findMany({});
  if (!response) throw Error("error while featiching all  syllabus");

  res.json({
    success: true,
    message: "all syllabus",
    data: response,
  });
});
export const fetchSyllabusName = asyncHandler(async (req: any, res: any) => {
  // here i can get exam from user

  let response = await prisma.syllabus.findMany({
    select: {
      id: true,
      type: true,
      title: true,
      description: true,
      SubjectSyllabusMap: {
        select: {
          subject: {
            select: {
              shortName: true,
              slug: true,
              order: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!response) throw Error("error while featiching all  syllabus");

  res.json({
    success: true,
    message: "all syllabus",
    data: response,
  });
});

// docne

export const addSubject = asyncHandler(async (req: any, res: any) => {
  let processedata = AddSubjectInputZodSchema.safeParse(req.body);

  if (!processedata.success) {
    throw ZodDataSafeParse(processedata, true);
  }

  let Subject_added = await prisma.subjectSyllabusMap.create({
    data: {
      ...processedata.data,
    },
  });

  if (!Subject_added) {
    return res
      .status(400)
      .json({ success: false, message: ` error while Subject  creation` });
  }

  return res.json({
    success: true,
    message: " Subject added ",
    data: Subject_added,
  });
});

export const removeSubject = asyncHandler(async (req: any, res: any) => {
  let { syllabusid, subjectid } = req.query;

  let Subject_removed = await prisma.subjectSyllabusMap.delete({
    where: {
      syllabusId_subject_id: {
        syllabusId: syllabusid,
        subject_id: subjectid,
      },
    },
  });

  if (!Subject_removed) {
    return res
      .status(400)
      .json({ success: false, message: ` error while Subject deletion` });
  }

  return res.json({
    success: true,
    message: " Subject removed  ",
    data: Subject_removed,
  });
});
export const addTopic = asyncHandler(async (req: any, res: any) => {
  let processedata = AddTopicInputZodSchema.safeParse(req.body);

  if (!processedata.success) {
    throw ZodDataSafeParse(processedata, true);
  }

  let { topic_id, subject_id, syllabusId, weightage } = processedata.data;

  let subject_map = await prisma.subjectSyllabusMap.findFirst({
    where: {
      syllabusId: syllabusId,
      subject_id: subject_id,
    },
  });

  if (!subject_map) throw Error(" syllabus doesnot have selected sullabus ");

  let subject_map_id: string = subject_map && subject_map?.id;

  let Subject_added = await prisma.topicsSubjectMap.create({
    data: {
      topic_id: topic_id,
      weightage: weightage,
      subject_map_id: subject_map_id,
    },
  });

  if (!Subject_added) {
    return res
      .status(400)
      .json({
        success: false,
        message: ` error while topie update in syllabus`,
      });
  }

  return res.json({
    success: true,
    message: " topic added ",
    data: Subject_added,
  });
});

export const removeTopic = asyncHandler(async (req: any, res: any) => {
  let { syllabusId, subjectId, topicId } = req.query;

  let subject_map = await prisma.subjectSyllabusMap.findFirst({
    where: {
      syllabusId: syllabusId,
      subject_id: subjectId,
    },
  });

  if (!subject_map) throw Error(" syllabus doesnot have selected sullabus ");

  let subject_map_id: string = subject_map && subject_map?.id;

  let Subject_removed = await prisma.topicsSubjectMap.delete({
    where: {
      subject_map_id_topic_id: {
        subject_map_id: subject_map_id,
        topic_id: topicId,
      },
    },
  });

  if (!Subject_removed) {
    return res
      .status(400)
      .json({
        success: false,
        message: ` error while topic  deletion for sullabus subject`,
      });
  }

  return res.json({
    success: true,
    message: " topic removed  ",
    data: Subject_removed,
  });
});

export const formatedSyllabus = asyncHandler(async (req: any, res: any) => {
  let { exam_year_id, syllabusid } = req.query;

  if (exam_year_id || syllabusid) {
    let syllabus = await prisma.syllabus.findFirst({
      where: exam_year_id ? { exam_year_id: exam_year_id } : { id: syllabusid },
      select: {
        SubjectSyllabusMap: {
          select: {
            subject: {
              select: {
                name: true,
                shortName: true,
              },
            },
            weightage: true,

            TopicsSubjectMap: {
              select: {
                Topic: {
                  select: {
                    name: true,
                    shortName: true,
                  },
                },
              },
            },
          },
        },
        exam_year: {
          select: {
            year: true,
            targetExam: {
              select: {
                shortCode: true,
              },
            },
          },
        },
        created_at: true,
        id: true,
      },
    });

    if (!syllabus) throw Error("syllabus data not exist ");

    let formated_syllabus: formatedSyllabus_type = {
      id: "",
      subjects: [],
      created_at: "",
      exam: "",
      examYear: 0,
    };

    formated_syllabus.id = syllabus.id;

    formated_syllabus.exam = syllabus?.exam_year?.targetExam.shortCode;
    formated_syllabus.examYear = syllabus?.exam_year?.year;
    formated_syllabus.created_at = syllabus.created_at.toISOString();

    syllabus.SubjectSyllabusMap.map((subjectData) => {
      let data: fomatedSubject_type = {
        subject: " ",
        weightage: 0,
        topics: [],
      };
      if (!subjectData.subject?.shortName)
        throw Error("subject short name invalid");

      data.subject = subjectData.subject?.shortName;
      data.weightage = subjectData.weightage;

      data.topics = subjectData.TopicsSubjectMap.map((topics) => {
        if (!topics.Topic.shortName) throw Error("topic short name invalid");
        return topics.Topic.shortName;
      });

      formated_syllabus.subjects.push(data);
    });

    return res.json({
      success: true,
      message: " formated syllabus",
      data: formated_syllabus,
    });
  } else {
    throw Error("invalid exam year id or syllabus id");
  }
});
