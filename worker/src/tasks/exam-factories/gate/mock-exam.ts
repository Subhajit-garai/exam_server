


// src/exam-factories/gate/mock-exam.ts
import { IExamCreator } from "../base-exam.js";

export class GateMockExam implements IExamCreator {
  constructor(private payload: any) {}

  async run(): Promise<void> {
    console.log("🧾 Creating GATE MOCK Exam:", this.payload);
    // Your logic here
  }
}
