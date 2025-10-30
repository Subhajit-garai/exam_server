import prisma from "../../db/index";
import { Questions_type, Task } from "../types";
import { waitForSomeThink } from "../helper/delay";
import { CreationTypes } from  "@repo/packages/prisma"
import _ from "lodash";
import { debuglog } from "../helper/debugLog";
import { examManager } from "../manager/examManager";
const em = examManager.getInstance();

export const MockSetProcessingStatus = async (
  id: string,
  data?: CreationTypes,
  action: "UPDATE" | "CHECK" = "CHECK"
): Promise<CreationTypes | null> => {
  let mockSet;

  switch (action) {
    case "UPDATE":
      mockSet = await prisma.mock_questions_set.update({
        where: { id },
        data: {
          status: data,
        },
        select: {
          status: true,
        },
      });

      break;

    default:
      mockSet = await prisma.mock_questions_set.findFirst({
        where: { id },
        select: {
          status: true,
        },
      });
      break;
  }

  return (mockSet && mockSet?.status) ?? null;
};

export const ProcessMockSet = async (id: string, action: string) => {
  let data: Task = {
    type: "MockSetProcessing",
    mockid: id,
    action: action,
  };
   em.getredisclient().push(data);  // create a queue 
};

