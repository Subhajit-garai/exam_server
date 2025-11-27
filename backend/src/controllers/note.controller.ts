import { error } from "console";
import prisma from "@repo/db/index.js";
import { asyncHandler } from "@repo/lib/helper/asyncHandler.js";
import {
  createSubject_schema,
  createTopic_schema,
  noteUpdate_schema,
} from "../zod/note.zod.js";
import { ZodDataSafeParse } from "@repo/lib/ZodTypeChecker.js";

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
    let topicid = "";

    let transaction = await prisma.$transaction(async (tx) => {
      let topicData = await tx.topic.findFirst({
        where: {
          id: topicid,
        },
      });

      if (!topicData) throw new Error("Topic data not found in database");
      let createAnotherVersion = await tx.topicNoteVersion.create({
        data: {
          topicId: topicData?.id,
          content: topicData?.content,
          version: topicData?.version,
          attachments: topicData?.attachments,
        },
      });
      if (!createAnotherVersion)
        throw new Error("error while create a version backup");

      let updatedContent = await tx.topic.update({
        where: {
          id: topicid,
        },
        data: {
          like: {
            increment: 1,
          },
        },
      });

      return updatedContent;
    });

    if (!transaction) {
      return res.status(400).json({
        success: false,
        message: "error while updateing like , plz try again",
      });
    }

    res.json({ success: true, message: "like added" });
  } catch (error) {
    console.log("Error in note controller --->", error);
  }
};
export const dislike = async (req: any, res: any) => {
  try {
    const { subject, topic } = req.params;
    if (!subject || !topic) throw new Error("subject or topic missing");
    let topicid = "";

    let transaction = await prisma.$transaction(async (tx) => {
      let topicData = await tx.topic.findFirst({
        where: {
          id: topicid,
        },
      });

      if (!topicData) throw new Error("Topic data not found in database");
      let createAnotherVersion = await tx.topicNoteVersion.create({
        data: {
          topicId: topicData?.id,
          content: topicData?.content,
          version: topicData?.version,
          attachments: topicData?.attachments,
        },
      });
      if (!createAnotherVersion)
        throw new Error("error while create a version backup");

      let updatedContent = await tx.topic.update({
        where: {
          id: topicid,
        },
        data: {
          dislike: {
            increment: 1,
          },
        },
      });

      return updatedContent;
    });

    if (!transaction) {
      return res.status(400).json({
        success: false,
        message: "error while updateing dislike , plz try again",
      });
    }

    res.json({ success: true, message: "dislike added" });
  } catch (error) {
    console.log("Error in note controller --->", error);
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

    let transaction = await prisma.$transaction(async (tx) => {
      let topicData = await tx.topic.findFirst({
        where: {
          id: topicid,
        },
      });

      if (!topicData) throw new Error("Topic data not found in database");
      let createAnotherVersion = await tx.topicNoteVersion.create({
        data: {
          topicId: topicData?.id,
          content: topicData?.content,
          version: topicData?.version,
          attachments: topicData?.attachments,
        },
      });
      if (!createAnotherVersion)
        throw new Error("error while create a version backup");

      let updatedContent = await tx.topic.update({
        where: {
          id: topicid,
        },
        data: {
          content: newContent,
          version: {
            increment: 1,
          },
        },
      });

      return updatedContent;
    });

    if (!transaction) {
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

    let subject = await prisma.topic.create({
      data: {
        ...processedData.data,
      },
    });

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

  let isExist = await prisma.subject.findFirst({
    where: {
      id: id,
    },
  });

  if (!isExist) throw new Error("Subject is not present ");

  let subject = await prisma.subject.delete({
    where: {
      id: id,
    },
  });
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

  let subject = await prisma.subject.create({
    data: {
      ...processedData.data,
    },
  });

  if (!subject) {
    throw new Error("subject creation faild");
  }
  res.json({ success: true, message: "message", data: "data" });
});

export const getAllVersionOfNote = async (req: any, res: any) => {
  try {
    const { topic } = req.params;

    if (!topic) throw new Error("topic is missing");

    let topicdata = await prisma.topic.findFirst({
      where: {
        slug: topic,
      },
    });

    let versions = await prisma.topicNoteVersion.findMany({
      where: {
        id: topicdata?.id,
      },
    });

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

    let subjectdata = await prisma.subject.findFirst({
      where: {
        slug: slug,
      },
    });

    let topicdatas = await prisma.topic.findMany({
      where: {
        subjectId: subjectdata?.id,
      },
      select: {
        id: true,
        order: true,
        name: true,
        shortName: true,
        description: true,
        created_at: true,
        updated_at: true,
        slug: true,
        iconUrl: true,
        color: true,
        isPublic: true,
        status: true,
        subjectId: true,
        isparentTopic: true,
        parentTopicId: true,
        tags: true,
        // content:true,
        like: true,
        dislike: true,
        readCount: true,
        comments: true,
        commentEnabled: true,
        verified: true,
        estimatedReadTime: true,
        version: true,
        attachments: true,
        publishedAt: true,
        language: true,
        createdBy: true,
        updatedBy: true,
      },
    });


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
    // const { subject, topic } = req.params;

    let subjectdatas = await prisma.subject.findMany({});

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

    let note = await prisma.topic.findFirst({
      where: {
        id: topicid,
      },
      select: {
        content: true,
        name: true,
        order: true,
        description: true,
        slug: true,
        tags: true,
        like: true,
        dislike: true,
        readCount: true,
        isPublic: true,
        estimatedReadTime: true,
        version: true,
        attachments: true,
        status: true,
      },
    });

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

    let note = await prisma.topic.findFirst({
      where: {
        slug: topic,
        subject: {
          slug: subject,
        },
      },
      select: {
        content: true,
        name: true,
        order: true,
        description: true,
        slug: true,
        tags: true,
        like: true,
        dislike: true,
        readCount: true,
        isPublic: true,
        estimatedReadTime: true,
        version: true,
        attachments: true,
        status: true,
      },
    });

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
