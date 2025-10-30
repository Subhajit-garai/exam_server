import { examformat } from  "@repo/packages/prisma"
import { JsonValue } from "@prisma/client/runtime/library";

export type exam_question_format_type = {
  id: string;
  number: number;
  options: string[];
  ans: string[];
  title: string;
  extra: JsonValue;
  formate: examformat;
  part: string;
  topic_id: string;
  is_multiple_ans: boolean;
  isSuffled: boolean;
};

type exam_question_map_format = {
  number: number;
  questionid: string;
  part: string;
  options: string[];
  ans: string[];
  examid: string;
  isSuffled: boolean;
};
