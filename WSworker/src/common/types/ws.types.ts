import { exam_question_format_for_ui_type } from "../questionTypes.js";

export type QuizHandlerType =
    | "QUIZ_START"
    | "QUESTION"
    | "JOIN_QUIZ"
    | "LEAVE_QUIZ"
    | "END_QUIZ"
    | "SUBMIT_ANSWER"
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

export interface QuestionPayload {
    quizId: string;
    question: exam_question_format_for_ui_type;
    startTime: string; // ISO string
    endTime: string;   // ISO string
}

export interface SubmitAnswerPayload {
    quizId: string;
    questionId: string;
    answer: string[];
    number: number;
    isMultiple: boolean;
    time?: string; // Client might send it, but we ignore it for logic
}

export interface AnswerSubmittedPayload {
    questionId: string;
    message: string;
}

export interface GenericMessagePayload {
    quizId?: string;
    message: string;
}
