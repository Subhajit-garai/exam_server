import prisma from "@repo/db/index.js";
import { asyncHandler } from "@repo/lib/helper/asyncHandler.js";
import { Request, Response } from "express";
import { BotService } from "../services/bot.service.js";

// Instantiate the service
const botService = new BotService();

export class BotController {

  public test = asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, message: "message", data: "data" });
  });

  /**
   * Checks if all questions are added to the exam and marks it as Done.
   */
  public examQuestionAddedCompletionStatusCheck = asyncHandler(async (req: Request, res: Response) => {
    const { examid } = req.params;
    const result = await botService.checkExamCompletionStatus(examid);

    res.json({
      success: true,
      message: "Questions added successfully, exam status changed to done",
      data: result,
    });
  });

  /**
   * Fetches syllabus data for exam creation.
   */
  public getSyllabusDataForExamCreattion = asyncHandler(async (req: Request, res: Response) => {
    const syllabusid = req.query.syllabusid as string;

    if (!syllabusid) throw new Error("Syllabus ID not received");

    const syllabusData = await prisma.syllabus.findFirst({
      where: { id: syllabusid },
      select: {
        SubjectSyllabusMap: {
          select: {
            subject: { select: { shortName: true } },
          },
        },
      },
    });

    if (!syllabusData) throw new Error("Syllabus data not found");

    const syllabus = syllabusData.SubjectSyllabusMap.map((item) => item.subject.shortName);

    res.json({ success: true, message: "message", data: syllabus });
  });

  /**
   * Fetches question details by IDs.
   */
  public getQuestionViaIds = asyncHandler(async (req: Request, res: Response) => {
    const ids = req.body; // Array of IDs

    const questionData = await prisma.questions.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        title: true,
        topic_id: true,
        difficulty: true,
        subject_id: true,
        explanation: true,
        is_multiple_ans: true,
        status: true,
      },
    });

    if (!questionData || questionData.length === 0) throw new Error("Questions not found or invalid IDs");

    res.json({
      success: true,
      message: "Question info",
      data: questionData,
    });
  });

  /**
   * Updates user progress (last exam/quiz/etc taken).
   */
  public setUserProgress = asyncHandler(async (req: Request, res: Response) => {
    const { userid } = req.query;
    const { lastExamid, examType } = req.body;

    if (!userid || !lastExamid || !examType) {
      throw new Error("Missing required fields: userid, lastExamid, or examType");
    }

    await botService.updateUserProgress(userid as string, lastExamid, examType);

    res.json({ success: true, message: "Progress updated", data: userid });
  });

  /**
   * Fetches simple exam details.
   */
  public getExamDetails = asyncHandler(async (req: Request, res: Response) => {
    const { examid } = req.params;

    const data = await prisma.exam.findFirst({
      where: { id: examid },
    });

    if (!data) throw new Error("Exam details not found!");

    res.json({ success: true, message: "message", data: data });
  });

  /**
   * Handles bot notifications (ban/unban).
   */
  public processNotification = async (req: any, res: Response) => {
    try {
      const type = req.query.type as string;
      const data = req.body;
      const botUserId = req.bot_user; // Assuming this comes from middleware

      const result = await botService.processNotification(type, data, botUserId);

      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error("Error in processNotification:", error);

      // If it's a known error (thrown by us), send 400. Otherwise 500.
      const statusCode = error.message.includes("Invalid data") || error.message.includes("Unknown") ? 400 : 500;

      res.status(statusCode).json({
        success: false,
        message: error.message || "Server error while processing notification",
      });
    }
  };
}

// Export instances of the methods to maintain backward compatibility with routes if needed,
// OR export the class instance if you plan to update routes.
// For now, let's export the methods bound to the instance to match the previous export style 
// so we don't break the router file (unless the user wants to update router too).
// BUT the user asked to "make class". 
// Usually, you would export the instance: export const botController = new BotController();
// And in routes: router.get('/test', botController.test);

const controller = new BotController();

export const test = controller.test;
export const examQuestionAddedCompletionStatusCheck = controller.examQuestionAddedCompletionStatusCheck;
export const getSyllabusDataForExamCreattion = controller.getSyllabusDataForExamCreattion;
export const getQuestionViaIds = controller.getQuestionViaIds;
export const setUserProgress = controller.setUserProgress;
export const getExamDetails = controller.getExamDetails;
export const processNotification = controller.processNotification;
