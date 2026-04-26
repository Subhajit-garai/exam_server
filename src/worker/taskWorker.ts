import { Worker, Job } from "bullmq";
import { QueueManager } from "@/lib/queue/queueManager.js";
import { Task } from "@/lib/types/types.js";
import { runWorker } from "./runWorker.js";
import { logger } from "@/utils/logger.js";

const redis = QueueManager.getInstance().getclient();

export const initTaskWorker = () => {
  const worker = new Worker<Task>(
    "task",
    async (job: Job<Task>) => {
      logger.info(`[Worker] Processing job ${job.id} of type ${job.name}`);
      await runWorker(job.data);
    },
    {
      connection: redis,
      concurrency: 5, // Process up to 5 jobs simultaneously
    }
  );

  worker.on("completed", (job) => {
    logger.success(`[Worker] Job ${job.id} has completed!`);
  });

  worker.on("failed", (job, err) => {
    logger.error(`[Worker] Job ${job?.id} has failed with ${err.message}`);
  });

  logger.info("BullMQ Worker initialized");
  return worker;
};
