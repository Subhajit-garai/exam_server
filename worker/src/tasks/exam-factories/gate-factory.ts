// src/exam-factories/gate-factory.ts

import { IExamCreator } from "./base-exam";
import { GateDppExam } from "./gate/dpp-exam";
import { GateMockExam } from "./gate/mock-exam";
import { GateQuizExam } from "./gate/quiz-exam";
import { GateTestExam } from "./gate/test-exam";

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
