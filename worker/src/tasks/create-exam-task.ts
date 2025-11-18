// src/workers/create-exam-task.ts
import { BaseWorkerTask } from "./base-task";
import { GateExamFactory } from "./exam-factories/gate-factory";
import { JecaExamFactory } from "./exam-factories/jeca-factory";

export class CreateExamTask extends BaseWorkerTask {
  async execute(): Promise<void> {
    const { category, variant, payload } = this.task;

    if (!category || !variant) {
      throw new Error("Missing category or variant in exam task");
    }

    switch (category) {
      case "JECA":
        await JecaExamFactory.create(variant, payload).run();
        break;
      case "GATE":
        await GateExamFactory.create(variant, payload).run();
        break;
      default:
        throw new Error(`Unsupported category: ${category}`);
    }
  }
}
