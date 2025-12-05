import { Router } from "express";
import prisma from "@repo/db/index.js";
import { backupQuestion } from "../controllers/question.controller.js";

export const DataManageRouter = Router();

export const Updater_authenticate = async (
  req: any,
  res: any,
  next: () => any
) => {
  let token = req.cookies.token;
  // bot user jwt &&  bot token
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required" });
  }
  try {
    if (token === process.env.UPDATER_TOKEN) {
      next();
    } else {
      return res
        .status(401)
        .json({ success: false, message: "valid token  required" });
    }
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

async function backupMockAndPyq(req: any, res: any) {
  try {
    let result = await prisma.exam.findMany({
      where: {
        examtype: {
          in: ["Mock", "PYQ"],
        },
      },
    });

    let mock_question_set = await prisma.question_map.findMany({
      where: {
        exam: {
          examtype: {
            in: ["Mock", "PYQ"],
          },
        },
      },
    });

    if (!result && !mock_question_set) {
      return res.status(500).json({
        success: false,
        message: "Mock and pyq  or Mockset are empty",
      });
    }

    res.status(200).json({
      success: true,
      message: "back up mock , pyq  and mock_question_sets",
      data: { test: result, mock_set: mock_question_set },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "surver error bulk question insert",
    });
  }
}
async function insertBulkData(req: any, res: any) {
  try {
    let bulkData = req.body;

    // console.log(bulkData);

    const result = await prisma.questions.createMany({
      data: bulkData,
      skipDuplicates: true, // Optional: skips records with duplicate unique keys
    });

    console.log("result", result);

    if (!result) {
      return res.status(500).json({
        success: false,
        message: "surver error bulk question insert",
      });
    }

    res.status(200).json({
      success: true,
      message: "surver add bulk questions",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "surver error bulk question insert",
    });
  }
}

DataManageRouter.post(
  "/admin/bulkinsertQuestion",
  Updater_authenticate,
  insertBulkData
);

DataManageRouter.post(
  "/admin/backup/importent/tables",
  Updater_authenticate,
  backupImportantTables
);

async function backupImportantTables(req: any, res: any) {
  try {
    const categories = await prisma.category.findMany({
      include: { subjects: true, targetExams: true },
    });
    const subjects = await prisma.subject.findMany({
      include: { topics: true },
    });
    const targetExams = await prisma.targetExam.findMany({
      include: { examYears: true },
    });
    const questions = await prisma.questions.findMany();

    res.status(200).json({
      success: true,
      message: "Backup of important tables",
      data: {
        categories,
        subjects,
        targetExams,
        questions,
      },
    });
  } catch (error) {
    console.error("Backup error:", error);
    res.status(500).json({ success: false, message: "Backup failed" });
  }
}







DataManageRouter.get(
  "/admin/mockandpyq/test/all",
  Updater_authenticate,
  backupMockAndPyq
);
