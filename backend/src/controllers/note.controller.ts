import { asyncHandler } from "@repo/lib/helper/asyncHandler.js";
import {
  createSubject_schema,
  createTopic_schema,
  noteUpdate_schema,
} from "../zod/note.zod.js";
import { ZodDataSafeParse } from "@repo/lib/ZodTypeChecker.js";
import { NoteService } from "../services/note.service.js";

const noteService = new NoteService();

export const test = async (req: any, res: any) => {
  try {
    res.json({ success: true, message: "message", data: "data" });
  } catch (error) {
    console.log("Error in note controller --->", error);
  }
};

export const like = async (req: any, res: any) => {
  try {
    const { subject, topic } = req.params;
    if (!subject || !topic) throw new Error("subject or topic missing");

    // Assuming 'topic' param is the slug, passing it to service
    const updatedContent = await noteService.like(topic);

    if (!updatedContent) {
      return res.status(400).json({
        success: false,
        message: "error while updateing like , plz try again",
      });
    }

    res.json({ success: true, message: "like added" });
  } catch (error) {
    console.log("Error in note controller --->", error);
    res.status(500).json({ success: false, message: "Error adding like" });
  }
};

export const dislike = async (req: any, res: any) => {
  try {
    const { subject, topic } = req.params;
    if (!subject || !topic) throw new Error("subject or topic missing");

    const updatedContent = await noteService.dislike(topic);

    if (!updatedContent) {
      return res.status(400).json({
        success: false,
        message: "error while updateing dislike , plz try again",
      });
    }

    res.json({ success: true, message: "dislike added" });
  } catch (error) {
    console.log("Error in note controller --->", error);
    res.status(500).json({ success: false, message: "Error adding dislike" });
  }
};

export const UpdateContentOfTopic = async (req: any, res: any) => {
  try {
    let data = req.body;

    let processedData = noteUpdate_schema.safeParse(data);

    if (!processedData.success) {
      console.log("data error ---> ", processedData.error);

      return res.status(400).json({
        success: false,
        message: "notification catch ,but data not recived ",
      });
    }

    let newContent = processedData.data.content;
    let topicid = processedData.data.topicid;

    const updatedContent = await noteService.updateContentOfTopic(topicid, newContent);

    if (!updatedContent) {
      return res.status(400).json({
        success: false,
        message: "error while updateing Content , plz try again",
      });
    }

    res.json({ success: true, message: " Content updated", data: "" });
  } catch (error) {
    console.log("Error in note controller --->", error);
  }
};

export const CreateTopic = async (req: any, res: any) => {
  try {
    let data = req.body;
    let processedData = createTopic_schema.safeParse(data);

    if (!processedData.success) {
      console.log("data error ---> ", processedData.error);

      return res.status(400).json({
        success: false,
        message: "notification catch ,but data not recived ",
      });
    }

    let subject = await noteService.createTopic(processedData.data);

    if (!subject) {
      return res.status(400).json({
        success: false,
        message: "error while creating topic , plz try again",
      });
    }
    res.json({ success: true, message: "message", data: "data" });
  } catch (error) {
    console.log("Error in note controller --->", error);
  }
};

export const DeleteSubject = asyncHandler(async (req: any, res: any) => {
  const { id } = req.query;

  if (!id && typeof id != "string") {
    return res.status(400).json({
      success: false,
      message: "notification catch ,but id not recived ",
    });
  }

  let subject = await noteService.deleteSubject(id);

  if (!subject) {
    return res.status(400).json({
      success: false,
      message: "error while deleting subject , plz try again",
    });
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
    throw new Error("subject creation faild");
  }
  res.json({ success: true, message: "message", data: "data" });
});

export const getAllVersionOfNote = async (req: any, res: any) => {
  try {
    const { topic } = req.params;

    if (!topic) throw new Error("topic is missing");

    let versions = await noteService.getAllVersionOfNote(topic);

    res.json({
      success: true,
      message: `all version of ${topic} `,
      data: versions,
    });
  } catch (error) {
    console.log("Error in note controller --->", error);
  }
};

export const getAllNoteTopic = async (req: any, res: any) => {
  try {
    const { slug } = req.params;

    if (!slug) throw new Error("subject is missing");

    let topicdatas = await noteService.getAllNoteTopic(slug);

    if (!topicdatas) {
      return res.status(400).json({
        success: false,
        message: "error while getting Topics , plz try again",
      });
    }

    res.json({ success: true, message: "Topics", data: topicdatas });
  } catch (error) {
    console.log("Error in note controller --->", error);
  }
};

export const getAllNoteSubject = async (req: any, res: any) => {
  try {
    const { exam } = req.query;
    let subjectdatas = await noteService.getAllNoteSubject(exam as string);

    if (!subjectdatas) {
      return res.status(400).json({
        success: false,
        message: "error while getting Subject , plz try again",
      });
    }

    res.json({ success: true, message: "Subjects", data: subjectdatas });
  } catch (error) {
    console.log("Error in note controller --->", error);
  }
};

export const getTopic = async (req: any, res: any) => {
  try {
    const topicid = req.query.topicid;

    let note = await noteService.getTopic(topicid);

    if (!note) {
      return res.status(400).json({
        success: false,
        message: "error while getting note Content , plz try again",
      });
    }

    res.json({ success: true, message: "message", data: note });
  } catch (error) {
    console.log("Error in note controller --->", error);
  }
};

export const getNote = async (req: any, res: any) => {
  try {
    const { subject, topic } = req.params;
    if (!subject || !topic) throw new Error("subject or topic missing");

    let note = await noteService.getNote(subject, topic);

    if (!note) {
      return res.status(400).json({
        success: false,
        message: "error while getting note Content , plz try again",
      });
    }

    res.json({ success: true, message: "message", data: note });
  } catch (error) {
    console.log("Error in note controller --->", error);
  }
};
