// src/workers/worker-runner.ts

import { Task } from "@/lib/types/types";
import { TaskFactory } from "./task-factory";
import { logger } from "@/utils/logger";
import { metrics } from "@/utils/metrics";

export async function runWorker(task: Task) {
  const instance = TaskFactory.create(task);
  const name = instance.constructor.name;

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
