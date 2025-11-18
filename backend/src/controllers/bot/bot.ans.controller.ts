import { asyncHandler } from "@/lib/helper/asyncHandler";
import prisma from "@repo/db/index";

export const getMockAns = asyncHandler(async (req: any, res: any) => {
  let mockid = req.params.mockid;

  type ansFormat = {
    id: string; // number
    ans: string[];
    part: string;
    topic_id: string;
  };

  let ANS: ansFormat[] = [];
  let questions = await prisma.question_map.findMany({
    where: {
      examid: mockid,
    },
  });

  if (!questions) throw new Error("Exam invalid or exam doesn't have any ans ");

  let questionids = questions.map((item) => item.questionid);

  let question_data = await prisma.questions.findMany({
    where: {
      id: {
        in: questionids,
      },
    },
    select: {
      id: true,
      ans: true,
      topic_id: true,
    },
  });

  if (!question_data) throw new Error("question info not found");
  let question_data_map: Map<
    string,
    {
      id: string;
      ans: string[];
      topic_id: string;
    }
  > = new Map();

  question_data.map((data) => {
    question_data_map.set(data.id, data);
  });
  questions.map((question) => {
    let que = question_data_map.get(question.questionid);
    if (!que) throw new Error("question info not match");
    let tempAns: ansFormat = {
      id: String(question.number),
      topic_id: que?.topic_id,
      part: question.part,
      ans: que?.ans,
    };
    ANS.push(tempAns);
  });
  res.json({ success: true, message: "Ans proccessing complete ", data: ANS });
});
export const getExamAns = asyncHandler(async (req: any, res: any) => {
  let examid = req.params.examid;

  // {"id":"number","ans":["2"],"part":"part1","topic":"COMPUTER"}
  type ansFormat = {
    id: string; // number
    ans: string[];
    part: string;
    topic_id: string;
  };

  let ANS: ansFormat[] = [];
  let questions = await prisma.question_map.findMany({
    where: {
      examid: examid,
    },
  });

  if (!questions) throw new Error("Exam invalid or exam doesn't have any ans ");

  let questionids = questions.map((item) => item.questionid);

  let question_data = await prisma.questions.findMany({
    where: {
      id: {
        in: questionids,
      },
    },
    select: {
      id: true,
      ans: true,
      topic_id: true,
    },
  });

  if (!question_data) throw new Error("question info not found");
  let question_data_map: Map<
    string,
    {
      id: string;
      ans: string[];
      topic_id: string;
    }
  > = new Map();

  question_data.map((data) => {
    question_data_map.set(data.id, data);
  });
  questions.map((question) => {
    let que = question_data_map.get(question.questionid);
    if (!que) throw new Error("question info not match");

    let tempAns: ansFormat = {
      id: String(question.number),
      topic_id: que?.topic_id,
      part: question.part,
      ans: que?.ans,
    };
    ANS.push(tempAns);
  });
  res.json({ success: true, message: "Ans proccessing complete ", data: ANS });
});

export const SetUserans = asyncHandler(async (req: any, res: any) => {
  let { userid, examid, questionid, shuffleMap, selectedOption } = req.body;

  console.log("--->");

  let isAnsExist = await prisma.userAns.findFirst({
    where: {
      examId: examid,
      userId: userid,
      questionId: questionid,
    },
  });
  if (isAnsExist) {
    console.log("ans already added for this user .. -> ", userid);

    let responce = await prisma.userAns.update({
      where: {
        examId_userId_questionId: {
          examId: examid,
          userId: userid,
          questionId: questionid,
        },
      },
      data: {
        selectedOption: selectedOption,
      },
    });

    if (!responce) throw Error("user Ans not created");
  } else {
    let responce = await prisma.userAns.create({
      data: {
        selectedOption: selectedOption,
        examId: examid,
        userId: userid,
        questionId: questionid,
        shuffleMap: shuffleMap,
      },
    });

    if (!responce) throw Error("user Ans not created");
  }

  res.json({
    success: true,
    message: "user ans added into db",
    data: "no data ",
  });
});

export const getUserans = asyncHandler(async (req: any, res: any) => {
  let { userid, examid } = req.params;

  let userAns = await prisma.userAns.findFirst({
    where: {
      examId: examid,
      userId: userid,
    },
  });

  // if later we need to add multiple attemp then , change here

  if (!userAns) {
    throw new Error("user ans not exits");
  }
  res.json({ success: true, message: "message", data: userAns });
});
