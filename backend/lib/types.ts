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

export type Task =
  | {
      type: "CreateExam";
      examid: string;
      userid: string;
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
      id: string;
      ismultiple: boolean;
    }
  | {
      type: "createQuiz";
      cburl: string;
      chatid: number;
      userid: number;
      topics: string[];
      totalQuetions: number;
      nextQuestionTime: number;
      quizOpenFor: number;
    }
  | {
      type: "CreateDpp";
      topics: string[];
      totalQuetions: number;
    };
