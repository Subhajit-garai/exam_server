


// src/exam-factories/gate/quiz-exam.ts
import { IExamCreator } from "../base-exam";

export class GateQuizExam implements IExamCreator {
  constructor(private payload: any) {}

  async run(): Promise<void> {
    console.log("🧾 Creating GATE Quiz Exam:", this.payload);
    // Your logic here
  }
}
