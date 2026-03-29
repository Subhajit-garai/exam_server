// src/exam-factories/jeca/quiz-exam.ts
import { IExamCreator } from "../base-exam.js";

export class JecaQuizExam implements IExamCreator {
  constructor(private payload: any) {}

  async run(): Promise<void> {
    console.log("🧾 Creating JECA Quiz Exam:", this.payload);
    // Your logic here
  }
}
