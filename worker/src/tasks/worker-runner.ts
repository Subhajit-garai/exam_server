// src/workers/worker-runner.ts

import { Task } from "@/lib/types/types";
import { TaskFactory } from "./task-factory";
import { logger } from "@/utils/logger";
import { metrics } from "@/utils/metrics";
import { BaseWorkerTask } from "./base-task";

export async function runWorker(task: Task) {
  let name: string = "NoEvent";
  let instance: BaseWorkerTask | null = null;

  try {
    instance = TaskFactory.create(task);
    name = instance.constructor.name;
  } catch (err) {
    logger.error(
      `[Worker] Failed to create event instance for type: ${task.type}`,
      err
    );
    return;
  }

  logger.info(`[Worker] Starting task ${name} (${task.id})`);

  const start = Date.now();

  try {
    await instance.run();
    const time = Date.now() - start;
    logger.success(`[Worker] Completed ${name} in ${time}ms`);
    metrics.recordSuccess(name, time);
  } catch (err) {
    logger.error(`[Worker] Task ${name} failed:`, err);
    metrics.recordFailure(name);
  }
}
