// src/exam-factories/jeca-factory.ts
import { IExamCreator } from "./base-exam.js";
import { JecaDppExam } from "./jeca/dpp-exam.js";
import { JecaMockExam } from "./jeca/mock-exam.js";
import { JecaQuizExam } from "./jeca/quiz-exam.js";
import { JecaTestExam } from "./jeca/test-exam.js";
export class JecaExamFactory {
  static create(variant: string, payload: any): IExamCreator {

    console.log(variant.toUpperCase());

    switch (variant.toUpperCase()) {
      case "TEST":
        return new JecaTestExam(payload);
      case "MOCK":
        return new JecaMockExam(payload);
      case "DPP":
        return new JecaDppExam(payload);
      case "QUIZ":
        return new JecaQuizExam(payload);
      default:
        throw new Error(`Unknown JECA exam variant: ${variant}`);
    }
  }
}
