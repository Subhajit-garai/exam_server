import prisma from "../../db/index.js";
import { Task } from "../types.js";
import { CreationTypes } from "@repo/prisma/client.js"
import _ from "lodash";
import { ExamManager } from "../manager/examManager.js";
const em = ExamManager.getInstance();

export const MockSetProcessingStatus = async (
  id: string,
  data?: CreationTypes,
  action: "UPDATE" | "CHECK" = "CHECK"
): Promise<CreationTypes | null> => {
  let mockSet;

  switch (action) {
    case "UPDATE":
      mockSet = await prisma.exam.update({
        where: { id },
        data: {
          creationstatus: data,
        },
        select: {
          creationstatus: true,
        },
      });

      break;

    default:
      mockSet = await prisma.exam.findFirst({
        where: { id },
        select: {
          creationstatus: true,
        },
      });
      break;
  }

  return (mockSet && mockSet?.creationstatus) ?? null;
};

export const ProcessMockSet = async (id: string, action: string) => {
  let data: Task = {
    id: id,
    type: "CREATE_EXAM",
    payload: {
      mockid: id,
      action: action,
    },
    variant: "Mock",
    category: "JECA"
  };
  em.getRedisClient().push(data);  // create a queue 
};

