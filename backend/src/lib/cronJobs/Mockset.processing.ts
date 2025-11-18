import prisma from "../../db/index";
import { Questions_type, Task } from "../types";
import { waitForSomeThink } from "../helper/delay";
import { CreationTypes } from  "@repo/prisma/client"
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
    id:id,
    type: "CREATE_EXAM",
    payload:{
    mockid: id,
    action: action,
    },
    variant:"Mock",
    category:"JECA"
  };
   em.getredisclient().push(data);  // create a queue 
};

