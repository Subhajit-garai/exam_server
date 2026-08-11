

export type question_ans_db_save_formt = {
    examid: string;
    userid: string;
    questionid: string;
    shuffleMap: number[];
    selectedOption: string[];
}

export type exam_question_format_type = {
  number: number;
  part: string;
  question: {
    id: string;
    title: string;
    options: string[];
    map: number[];
    extra: object;
    format: string;
    is_multiple_ans: boolean;
  } | null;
};