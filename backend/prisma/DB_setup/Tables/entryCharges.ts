import { ExamType } from  "@repo/packages/prisma";
import prisma from  "@repo/db/index";


export const entryCharges = async (userid:string) => {
  const Exam_EntryChargeList = await prisma.entryChargeList.create({
    data: {
      type: ExamType.Exam,
      Charge: 10,
      created_by: userid,
    },
  });

  const Subject_EntryChargeList = await prisma.entryChargeList.create({
    data: {
      type: ExamType.Subject,
      Charge: 10,
      created_by: userid,
    },
  });
  const Contest_EntryChargeList = await prisma.entryChargeList.create({
    data: {
      type: ExamType.Contest,
      Charge: 10,
      created_by: userid,
    },
  });
  const Dpp_EntryChargeList = await prisma.entryChargeList.create({
    data: {
      type: ExamType.Dpp,
      Charge: 5,
      created_by: userid,
    },
  });
  const Mock_EntryChargeList = await prisma.entryChargeList.create({
    data: {
      type: ExamType.Mock,
      Charge: 20,
      created_by: userid,
    },
  });
  const PYQ_EntryChargeList = await prisma.entryChargeList.create({
    data: {
      type: ExamType.PYQ,
      Charge: 15,
      created_by: userid,
    },
  });
};
