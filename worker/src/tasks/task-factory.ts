// src/workers/task-factory.ts
import { Task } from "@/lib/types/types";
import { AnsProcessingTask } from "./ans-processing-task";
import { BaseWorkerTask } from "./base-task";
import { CreateExamTask } from "./create-exam-task";
import { CreateScoreTask } from "./create-score-task";
import { QuizProcessingTask } from "./quiz-processing-task";

export class TaskFactory {
  static create(task: Task): BaseWorkerTask {
    switch (task.type) {
      case "CREATE_EXAM":
        return new CreateExamTask(task);
      case "CREATE_SCORE":
        return new CreateScoreTask(task);
      case "ANS_PROCESSING":
        return new AnsProcessingTask(task);
      case "SEND_QUIZ_DATA":
        return new QuizProcessingTask(task);
      default:
        throw new Error(`unknown task type: ${task.type}`);
    }
  }
}
