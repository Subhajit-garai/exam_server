// src/exam-factories/base-exam.ts
export interface IExamCreator {
  run(): Promise<void>;
}
