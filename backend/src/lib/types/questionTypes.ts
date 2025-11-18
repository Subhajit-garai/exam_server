import { examformat } from "@repo/prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";

export type exam_question_format_type = {
  number: number;
  part: string;
  question: {
    id: string;
    title: string;
    options: string[];
    map: number[];
    extra: JsonValue;
    format: string;
    is_multiple_ans: boolean;
  } | null;
};

export type exam_question_format_for_ui_type = {
  number: number;
  part: string;
  question: {
    questionid: string;
    title: string;
    options: string[];
    extra: JsonValue;
    format: string;
    is_multiple_ans: boolean;
  };
};
