import { asyncHandler } from "@/lib/helper/asyncHandler.js";
import {
  AddSubjectInputZodSchemaById,
  AddSubjectInputZodSchemaByName,
  AddSubjectInputZodSchemaByShortName,
  AddTopicInputZodSchemaById,
  AddTopicInputZodSchemaByName,
  AddTopicInputZodSchemaByShortName,
  SyllabusInputZodSchema,
} from "@/zod/syllabus.zod.js";
import { ZodDataSafeParse } from "@/lib/ZodTypeChecker.js";
import { SyllabusService } from "../services/syllabus.service.js";

const syllabusService = new SyllabusService();

export const text = asyncHandler(async (req: any, res: any) => { });

export const CreateSyllabus = asyncHandler(async (req: any, res: any) => {
  let data = SyllabusInputZodSchema.safeParse(req.body);

  if (!data.success) {
    return res.status(401).json({
      success: false,
      message: "given credential/input   invalid ",
    });
  }

  const response = await syllabusService.createSyllabus(data.data);

  return res.json({
    success: true,
    message: `Syllabus created  `,
  });
});

export const getSyllabusByid = asyncHandler(async (req: any, res: any) => {
  let syllabusid = req.query.syllabusid;
  const response = await syllabusService.getSyllabusById(syllabusid);

  let syllabus: any = []; //  response?.topics;

  res.json({
    success: true,
    message: `Syllabus data`,
    syllabus: syllabus,
  });
});

export const fetchAllsyllabusExamYearid = asyncHandler(async (req: any, res: any) => {
  let { id } = req.query;
  const response = await syllabusService.getSyllabusByExamYearId(id);

  res.json({
    success: true,
    message: "all syllabus ",
    data: response,
  });
});

export const fetchAllsyllabus_id = asyncHandler(async (req: any, res: any) => {
  let { id } = req.query;
  const response = await syllabusService.getSyllabusById(id);

  res.json({
    success: true,
    message: "all syllabus",
    data: response,
  });
});

export const fetchAllsyllabus = asyncHandler(async (req: any, res: any) => {
  const response = await syllabusService.getAllSyllabus();

  res.json({
    success: true,
    message: "all syllabus",
    data: response,
  });
});

export const fetchSyllabusName = asyncHandler(async (req: any, res: any) => {
  const response = await syllabusService.getSyllabusName();

  res.json({
    success: true,
    message: "all syllabus",
    data: response,
  });
});

export const addSubject = asyncHandler(async (req: any, res: any) => {
  let by: "id" | "name" | "shortname" = req.query.by ?? "id";
  const Subject_added = await syllabusService.addSubject(req.body, by);

  return res.json({
    success: true,
    message: " Subject added ",
    data: Subject_added,
  });
});

export const removeSubject = asyncHandler(async (req: any, res: any) => {
  let { syllabusid, subjectid } = req.query;
  const Subject_removed = await syllabusService.removeSubject(syllabusid, subjectid);

  return res.json({
    success: true,
    message: " Subject removed  ",
    data: Subject_removed,
  });
});

export const addTopic = asyncHandler(async (req: any, res: any) => {
  let by: "id" | "name" | "shortname" = req.query.by ?? "id";
  const Subject_added = await syllabusService.addTopic(req.body, by);

  return res.json({
    success: true,
    message: " topic added ",
    data: Subject_added,
  });
});

export const removeTopic = asyncHandler(async (req: any, res: any) => {
  let { syllabusId, subjectId, topicId } = req.query;
  const Subject_removed = await syllabusService.removeTopic(syllabusId, subjectId, topicId);

  return res.json({
    success: true,
    message: " topic removed  ",
    data: Subject_removed,
  });
});

export const formatedSyllabus = asyncHandler(async (req: any, res: any) => {
  let { exam_year_id, syllabusid } = req.query;
  const formated_syllabus = await syllabusService.getFormattedSyllabus(exam_year_id, syllabusid);

  return res.json({
    success: true,
    message: " formated syllabus",
    data: formated_syllabus,
  });
});
