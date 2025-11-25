import { asyncHandler } from "@/lib/helper/asyncHandler";
import { exam_question_format_type } from "@/lib/types/questionTypes";
import prisma from "@repo/db/index";




export const getQuestionsIds = asyncHandler(async (req: any, res: any) => {  
  // here topic is chage to an other table so  old_topic now represrnt topic

  let topicNormalAnsQuestions =
    await prisma.$queryRaw`SELECT old_topic, ARRAY_AGG(id) AS ids FROM "Questions"  WHERE is_multiple_ans = false AND status = 'Done' GROUP BY old_topic; `;
  let topicMultiplaAnsQuestions =
    await prisma.$queryRaw`SELECT old_topic, ARRAY_AGG(id) AS ids FROM "Questions"  WHERE is_multiple_ans = true AND status = 'Done' GROUP BY old_topic; `;    
  res.json({
    success: true,
    message: "message",
    data: { topicNormalAnsQuestions, topicMultiplaAnsQuestions },
  });
});

export const getQuestionsByids = asyncHandler(async (req: any, res: any) => {
  let ids = req.body;

  let responce = await prisma.questions.findMany({
    where: {
      id: { in: ids },
    },
    select: {
      ans: true,
      id: true,
      explanation: true,
      title: true,
      options: true,
      extra: true,
      format: true,
    },
  });
  if (!responce) throw new Error("question  not found for given ids ");

  res.json({ success: true, message: "question info", data: responce });
});
export const getQuestions = asyncHandler(async (req: any, res: any) => {
  let examid = req.body;
  let exam_questions: exam_question_format_type[] = [];

  let question_map_data = await prisma.question_map.findMany({
    where: {
      examid: examid,
    },
  });

  let questionids: string[] = [];
  question_map_data.map((question) => {
    questionids.push(question.questionid);
  });

  if (!questionids)
    throw new Error("given exam doesn't contain any questions ");

  let responce = await prisma.questions.findMany({
    where: {
      id: { in: questionids },
    },
    select: {
      ans: true,
      id: true,
      explanation: true,
      title: true,
      options: true,
      extra: true,
      format: true,
    },
  });

  if (!question_map_data)
    throw new Error("question map is not found for given exam ");

  res.json({ success: true, message: "question info", data: responce });
});

export const getExamQuestionAns = asyncHandler(async (req: any, res: any) => {
  try {
    type ansSchema = {
      ans: string[];
      number: number;
      topic: string;
    };

    let examid = req.query.examid;
    let QuestionIds: string[] = [];
    let QustionAnsFormat: ansSchema[] = [];
    let question_map_data = await prisma.question_map.findMany({
      where: {
        examid: examid,
      },
    });

    if (!question_map_data)
      throw new Error("question map is not found for given exam ");

    question_map_data.map((q) => {
      QuestionIds.push(q.questionid);
    });

    res.json({ success: true, message: "message", data: "data" });
  } catch (error) {
    console.log("Error in metrix --->", error);
  }
});

export const addQuestions = asyncHandler(async (req: any, res: any) => {
  let examid = req.params.examid;
  let questions = req.body;

  let data = await prisma.question_map.createMany({
    data: questions,
    // skipDuplicates:true
  });
  return res.json({ success: true, message: "questionAdded" });
});