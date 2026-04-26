import {
  Platform,
  ExamType,
  telegramgroupType,
} from "@repo/db/schema/enums.js";
import dayjs from "dayjs";
export type ExamMetaData = {
  examid: string;
  score: number;
  attempts: number;
  rank: number;
  inTop10: number; // number or boolean ??
  rignt: number;
  wrong: number;
  // topper: string;
  topperScore: number;
};

export type Questions_type = { [part: string]: string[] };
export type ExamQuestionsids = { [examid: string]: Questions_type };



export type ExamCategory = "JECA" | "GATE";
// export type ExamVariant = "TEXT" | "MOCK" | "DPP" | "QUIZ";

export type TaskType =
  | "CREATE_EXAM"
  | "MOCK_PROCESSING"
  | "CREATE_QUIZ"
  | "CREATE_SCORE"
  | "ANS_PROCESSING"
  | "SEND_NOFTIFICATION"
  | "SEND_QUIZ_DATA"
  | "QUIZ_ANS_PROCESSING";

export interface Task {
  id: string;
  type: TaskType;
  payload: Record<string, any>;
  category?: ExamCategory;
  variant?: ExamType;
  retries?: number;
}

