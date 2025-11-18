



// src/exam-factories/jeca/dpp-exam.ts
import { IExamCreator } from "../base-exam";

export class JecaDppExam implements IExamCreator {
  constructor(private payload: any) {}

  async run(): Promise<void> {
    console.log("🧾 Creating JECA DPP Exam:", this.payload);
    // Your logic here
  }
}
