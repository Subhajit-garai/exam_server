// src/workers/task-factory.ts
import { Task } from "@/lib/types/types.js";
import { AnsProcessingTask } from "./ans-processing-task.js";
import { BaseWorkerTask } from "./base-task.js";
import { CreateExamTask } from "./create-exam-task.js";
import { CreateScoreTask } from "./create-score-task.js";
import { QuizProcessingTask } from "./quiz-processing-task.js";
import { QuizCreateTask } from "./quiz/quiz-create-task.js";
import { QuizAnsTask } from "./quiz/quiz-ans-task.js";
import { MockProcessingTask } from "./mock-processing-task.js";

export class TaskFactory {
  static create(task: Task): BaseWorkerTask {
    switch (task.type) {
      case "CREATE_EXAM":
        return new CreateExamTask(task);
      case "CREATE_SCORE":
        return new CreateScoreTask(task);
      case "ANS_PROCESSING":
        return new AnsProcessingTask(task);
      case "MOCK_PROCESSING":
        return new MockProcessingTask(task);
      case "CREATE_QUIZ":
        return new QuizCreateTask(task);
      case "SEND_QUIZ_DATA": // for bot like telegram or whatsapp
        return new QuizProcessingTask(task);
      case "QUIZ_ANS_PROCESSING":
        return new QuizAnsTask(task);
      default:
        throw new Error(`unknown task type: ${task.type}`);
    }
  }
}
