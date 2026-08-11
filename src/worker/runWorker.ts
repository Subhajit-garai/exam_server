import { Task } from "@/lib/types/types.js";
import { logger } from "@/utils/logger.js";
import { TaskFactory } from "./tasks/task-factory.js";
import { BaseWorkerTask } from "./tasks/base-task.js";

// Metrics could be added here if needed, or using BullMQ's own metrics

export async function runWorker(task: Task) {
  let name: string = "NoEvent";
  let instance: BaseWorkerTask | null = null;

  try {
    instance = TaskFactory.create(task);
    name = instance.constructor.name;
  } catch (err) {
    logger.error(
      `[Worker] Failed to create event instance for type: ${task.type}`,
      err,
    );
    return;
  }

  logger.info(`[Worker] Starting task ${name} (${task.id})`);

  const start = Date.now();

  try {
    await instance.run();
    const time = Date.now() - start;
    logger.success(`[Worker] Completed ${name} in ${time}ms`);
  } catch (err) {
    logger.error(`[Worker] Task ${name} failed:`, err);
    throw err; // Re-throw to let BullMQ handle retries
  }
}
