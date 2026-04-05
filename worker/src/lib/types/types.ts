export type ExamType =
  | "Exam"
  | "Contest"
  | "Mock"
  | "PYQ"
  | "Subject"
  | "Dpp"
  | "Quiz";

export type botPlatform = "NONE" | "WEB" | "TELEGRAM" | "WHATSAPP";
export type telegramgroupType = "group" | "private" | "channel" | "supergroup";

export type exam_question_map_format = {
  number: number;
  questionid: string;
  part: string;
  examid: string;
};

export type ansType = {
  number: string;
  ans: string[];
  part: string;
  topic: string;
};
export type anskeyType = {
  id: string;
  part: string;
};

export type AnsStoreType = {
  [key: string]: ansType[];
};
export type AnsKeysTypes = {
  [key: string]: anskeyType[];
};

export type Right_Wrong = {
  Right: number;
  Wrong: number;
};

export type Right_Wrong_set_type = {
  [key: string]: Right_Wrong;
};

// src/types.ts
export type ExamCategory = "JECA" | "GATE";
export type ExamVariant = "Test" | "Contest" | "Mock" | "PYQ" | "Subject" | "Dpp" | "Quiz"
export type CreationTypes = "Created" | "Updated" | "Processing" | "Done" | "Suspended"

export type TaskType =

  | "CREATE_EXAM"
  | "MOCK_PROCESSING"
  | "CREATE_QUIZ"
  | "CREATE_SCORE"
  | "ANS_PROCESSING"
  | "SEND_QUIZ_DATA"
  | "SEND_NOFTIFICATION";

export interface Task {
  id: string;
  type: TaskType;
  payload: Record<string, any>;
  category?: ExamCategory;
  variant?: ExamVariant;
  retries?: number;
}
export interface EventTask {
  id: string;
  type: TaskType;
  payload: Record<string, any>;
  category?: ExamCategory;
  variant?: ExamVariant;
  retries?: number;
}



export type Questions_type = { [part: string]: string[] };
export type diffcultlevel = "Easy" | "Medium" | "Hard";
export type QuestionStatus =
  | "Created"
  | "Processing"
  | "Done"
  | "Duplicate"
  | "Suspended"
  | "Close";
export type Question_Data_type = {
  id: string;
  title: string;
  sub_topic: string;
  topic: string;
  explanation: string | null;
  is_multiple_ans: boolean;
  difficulty: diffcultlevel;
  status: QuestionStatus;
};

// export type exam_pattern = {
//   id: string;
//   created_by: string;
//   examname: string;
//   categoryId: string;
//   title: string | null;
//   format: string;
//   syllabus: "Generic" | "Syllabus";
//   syllabusid: string | null;
//   topics: string[];
//   difficulty: string;
//   part: boolean | null;
//   checkbox: boolean | null;
//   part_Count: number;
//   total_questions: number[];
//   check: string;
//   marks_values: number[];
//   neg_values: number[];
//   is_multiple_ans: number[];
// } | null;
