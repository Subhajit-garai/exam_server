// src/exam-factories/gate-factory.ts

import { IExamCreator } from "./base-exam.js";
import { GateDppExam } from "./gate/dpp-exam.js";
import { GateMockExam } from "./gate/mock-exam.js";
import { GateQuizExam } from "./gate/quiz-exam.js";
import { GateTestExam } from "./gate/test-exam.js";

export class GateExamFactory {
  static create(variant: string, payload: any): IExamCreator {
    switch (variant) {
      case "TEXT":
        return new GateTestExam(payload);
      case "MOCK":
        return new GateMockExam(payload);
      case "DPP":
        return new GateDppExam(payload);
      case "QUIZ":
        return new GateQuizExam(payload);
      default:
        throw new Error(`Unknown GATE exam variant: ${variant}`);
    }
  }
}
