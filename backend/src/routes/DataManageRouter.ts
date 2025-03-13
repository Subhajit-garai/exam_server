import { Router } from "express";
import prisma from "../../db";

export const DataManageRouter = Router();

DataManageRouter.post("/admin/bulkinsertQuestion", insertBulkData);

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
