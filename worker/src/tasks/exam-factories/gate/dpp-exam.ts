


// src/exam-factories/gate/dpp-exam.ts
import { IExamCreator } from "../base-exam";

export class GateDppExam implements IExamCreator {
  constructor(private payload: any) {}

  async run(): Promise<void> {
    console.log("🧾 Creating GATE DPP Exam:", this.payload);
    // Your logic here
  }
}
