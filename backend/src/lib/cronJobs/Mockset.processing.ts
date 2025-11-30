import prisma from "../../db/index.js";
import { Questions_type, Task } from "../types.js";
import { waitForSomeThink } from "../helper/delay.js";
import { CreationTypes } from "@repo/prisma/client.js"
import _ from "lodash";
import { debuglog } from "../helper/debugLog.js";
import { examManager } from "../manager/examManager.js";
const em = examManager.getInstance();

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
  em.getredisclient().push(data);  // create a queue 
};

