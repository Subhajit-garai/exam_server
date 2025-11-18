import { BaseWorkerTask } from "./base-task";

// src/workers/ans-processing-task.ts
export class ScoreProcessingTask extends BaseWorkerTask {
  async execute(): Promise<void> {
    console.log("Running ScoreProcessingTask with data:", this.task.payload);
  }
}
 