import { asyncHandler } from "@/lib/helper/asyncHandler";
import prisma from "@repo/db/index";



export const setUserScore = asyncHandler(async (req: any, res: any) => {
  let { examid, userid } = req.query;

  let userScore = req.body;

  let data = await prisma.score.findFirst({
    where: {
      exam_id: examid,
      user_id: userid,
    },
  });

  if (data) throw new Error("user score  present");

  let score = await prisma.score.create({
    data: {
      ...userScore,
    },
  });

  if (!score) throw new Error(" error while user score adding ");

  return res.json({ success: true, message: "user score added ", data: score });
});

export const getUserScore = asyncHandler(async (req: any, res: any) => {
  let { examid, userid } = req.query;
  let data = await prisma.score.findFirst({
    where: {
      exam_id: examid,
      user_id: userid,
    },
  });

  if (!data)
    return res.json({
      success: true,
      message: "user score not present ",
      data: null,
    });

  return res.json({ success: true, message: "user score  ", data: data });
});