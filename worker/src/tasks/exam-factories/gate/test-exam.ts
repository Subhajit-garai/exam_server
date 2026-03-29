// src/exam-factories/gate/test-exam.ts
import { IExamCreator } from "../base-exam.js";

export class GateTestExam implements IExamCreator {
  constructor(private payload: any) {}

  async run(): Promise<void> {
    console.log("🧾 Creating GATE Test Exam:", this.payload);
    // Your logic here
  }
}
