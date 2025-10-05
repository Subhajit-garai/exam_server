export type ExamType =
  | "Exam"
  | "Contest"
  | "Mock"
  | "PYQ"
  | "Subject"
  | "Dpp"
  | "Quiz";

export type exam_question_map_format = {
  number: number;
  questionid: string;
  part: string;
  options: string[];
  ans: string[];
  examid: string;
  isSuffled: boolean;
};

export type Task =
  | {
      type: "CreateExam";
      examid: string;
      userid: string;
      examtype: ExamType;
    }
  | {
      type: "MockSetProcessing";
      mockid: string;
      action: string;
      // status: string;
    }
  | {
      type: "CreateScore";
      examid: string;
      userid: string;
    }
  | {
      type: "Notify";
      // id:string,
      status: boolean;
      data: object;
      message: string;
    }
  | {
      type: "AnsProcessing";
      examid: string;
      userid: string;
      part: string;
      ans: string[];
      number: string;
      ismultiple: boolean;
    }
  | {
      type: "createQuiz";
      quizid: string;
      cburl: string;
      chatid: number;
      thread_id?: number;
      userid: number;
      topics: string[];
      totalQuetions: number;
      nextQuestionTime: number;
      quizOpenFor: number;
      ismultiple: boolean;
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
