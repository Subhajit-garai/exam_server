import { asyncHandler } from "@/utils/asyncHandler.js";
import {
  createSubject_schema,
  createTopic_schema,
  noteUpdate_schema,
} from "@/zod/note.zod.js";
import { ZodDataSafeParse } from "@/utils/ZodTypeChecker.js";
import { NoteService } from "./service.js";
import { CustomError } from "@/middleware/globalErrorHandler.js";

const noteService = new NoteService();

export const test = asyncHandler(async (req: any, res: any) => {
  res.json({ success: true, message: "message", data: "data" });
});

export const like = asyncHandler(async (req: any, res: any) => {
  const { subject, topic } = req.params;
  if (!subject || !topic) throw new Error("subject or topic missing");

  const updatedContent = await noteService.like(topic);

  if (!updatedContent) {
    throw new CustomError("Error updating like, please try again", 400);
  }

  res.json({ success: true, message: "like added" });
});

export const dislike = asyncHandler(async (req: any, res: any) => {
  const { subject, topic } = req.params;
  if (!subject || !topic) throw new Error("subject or topic missing");

  const updatedContent = await noteService.dislike(topic);

  if (!updatedContent) {
    throw new CustomError("Error updating dislike, please try again", 400);
  }

  res.json({ success: true, message: "dislike added" });
});

export const UpdateContentOfTopic = asyncHandler(async (req: any, res: any) => {
  let data = req.body;
  let processedData = noteUpdate_schema.safeParse(data);

  if (!processedData.success) {
    throw ZodDataSafeParse(processedData);
  }

  let newContent = processedData.data.content;
  let topicid = processedData.data.topicid;

  const updatedContent = await noteService.updateContentOfTopic(topicid, newContent);

  if (!updatedContent) {
    throw new CustomError("Error updating content, please try again", 400);
  }

  res.json({ success: true, message: " Content updated", data: "" });
});

export const CreateTopic = asyncHandler(async (req: any, res: any) => {
  let data = req.body;
  let processedData = createTopic_schema.safeParse(data);

  if (!processedData.success) {
    throw ZodDataSafeParse(processedData);
  }

  let subject = await noteService.createTopic(processedData.data);

  if (!subject) {
    throw new CustomError("Error creating topic, please try again", 400);
  }

  res.json({ success: true, message: "message", data: "data" });
});

export const DeleteTopic = asyncHandler(async (req: any, res: any) => {
  const { id } = req.query;

  if (!id && typeof id != "string") {
    throw new CustomError("topic id required", 400);
  }

  let topic = await noteService.deleteTopic(id as string);

  if (!topic) {
    throw new CustomError("Error deleting topic, please try again", 400);
  }

  res.json({ success: true, message: "Topic delete processed ", data: id });
});

export const DeleteSubject = asyncHandler(async (req: any, res: any) => {
  const { id } = req.query;

  if (!id && typeof id != "string") {
    throw new CustomError("subject id required", 400);
  }

  let subject = await noteService.deleteSubject(id as string);

  if (!subject) {
    throw new CustomError("Error deleting subject, please try again", 400);
  }

  res.json({ success: true, message: "Subject delete processed ", data: id });
});

export const CreateSubject = asyncHandler(async (req: any, res: any) => {
  let data = req.body;
  let processedData = createSubject_schema.safeParse(data);
  if (!processedData.success) {
    throw ZodDataSafeParse(processedData, true);
  }

  let subject = await noteService.createSubject(processedData.data);

  if (!subject) {
    throw new Error("Subject creation failed");
  }
  res.json({ success: true, message: "message", data: "data" });
});

export const getAllVersionOfNote = asyncHandler(async (req: any, res: any) => {
  const { topic } = req.params;

  if (!topic) throw new Error("topic is missing");

  let versions = await noteService.getAllVersionOfNote(topic);

  res.json({
    success: true,
    message: `all version of ${topic} `,
    data: versions,
  });
});

export const getAllNoteTopic = asyncHandler(async (req: any, res: any) => {
  const { subject } = req.params;

  if (!subject) throw new Error("subject is missing"); // subject is subject slug

  let topicdatas = await noteService.getAllNoteTopic(subject);

  if (!topicdatas) {
    throw new CustomError("Error fetching topics, please try again", 400);
  }

  res.json({ success: true, message: "Topics", data: topicdatas });
});

export const getAllNoteSubjectByCategory = asyncHandler(async (req: any, res: any) => {
  const { category } = req.params;

  let subjectdatas = await noteService.getAllNoteSubjectByCategory(category as string);

  if (!subjectdatas) {
    throw new CustomError("Error fetching subjects, please try again", 400);
  }

  res.json({ success: true, message: "Subjects", data: subjectdatas });
});

export const getAllNoteSubjectByExam = asyncHandler(async (req: any, res: any) => {
  const { exam } = req.query;

  let subjectdatas = await noteService.getAllNoteSubjectByExam(exam as string);

  if (!subjectdatas) {
    throw new CustomError("Error fetching subjects, please try again", 400);
  }

  res.json({ success: true, message: "Subjects", data: subjectdatas });
});

export const getAllNoteSubjectForUser = asyncHandler(async (req: any, res: any) => {
  let { user_exam_year_id, user_targeted_exam_id } = req;

  if (!user_exam_year_id || !user_targeted_exam_id) {
    throw new CustomError("user need to select target exam and exam year", 200);
  }

  let subjectdatas = await noteService.getAllNoteSubjectForUser(user_targeted_exam_id, user_exam_year_id);

  if (!subjectdatas) {
    throw new CustomError("error while getting Subject , plz try again", 400);
  }

  res.json({ success: true, message: "Subjects", data: subjectdatas });
});

export const getTopic = asyncHandler(async (req: any, res: any) => {
  const topicid = req.query.topicid;

  let note = await noteService.getTopic(topicid as string);

  if (!note) {
    throw new CustomError("Error fetching note content, please try again", 400);
  }

  res.json({ success: true, message: "message", data: note });
});

export const getNote = asyncHandler(async (req: any, res: any) => {
  const { subject, topic } = req.params;
  let userId = req.user;
  if (!subject || !topic) throw new Error("subject or topic missing");

  let note = await noteService.getNote(subject, topic, userId);

  if (!note) {
    throw new CustomError("Error fetching note content, please try again", 400);
  }

  res.json({ success: true, message: "message", data: note });
});
