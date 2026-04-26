export type exam_question_format_for_ui_type = {
    number: number;
    part: string;
    question: {
        questionid: string;
        title: string;
        options: string[];
        extra: any;
        format: string;
        is_multiple_ans: boolean;
    };
};

export type QuizHandlerType =
    | "QUIZ_START"
    | "QUESTION"
    | "JOIN_QUIZ"
    | "LEAVE_QUIZ"
    | "END_QUIZ"
    | "SUBMIT_ANSWER"
    | "QUIZ_RESULT"
    | "QUIZ_LEADERBOARD"
    | "QUIZ_STARTED"
    | "NEW_QUESTION"
    | "QUIZ_JOINED"
    | "QUIZ_LEFT"
    | "QUIZ_ENDED"
    | "ANSWER_SUBMITTED";

export interface WsMessage<T = any> {
    type: QuizHandlerType;
    payload: T;
    userIds?: string[];
    rooms?: string[];
}

export interface JoinQuizPayload {
    quizId: string;
}

export interface LeaveQuizPayload {
    quizId: string;
}

export interface EndQuizPayload {
    quizId: string;
}

export interface StartQuizPayload {
    quizId: string;
    startTime: Date;
    message?: string;
}

export interface QuizLeaderboardPayload {
    leaderboard: { name: string, avater?: string; score: string }[];
}

export interface QuestionPayload {
    quizId: string;
    question: exam_question_format_for_ui_type;
    startTime: string; 
    endTime: string;   
}

export interface SubmitAnswerPayload {
    quizId: string;
    questionId: string;
    answer: string[];
    number: number;
    isMultiple: boolean;
    time?: string; 
}
