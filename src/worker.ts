import "dotenv/config";
import { initTaskWorker } from "./worker/taskWorker.js";
import { QueueManager } from "@/lib/queue/queueManager.js";
import { logger } from "./utils/logger.js";
import "@/lib/event/index.js";

try {
  logger.info("Starting standalone BullMQ Worker process...");
  QueueManager.getInstance(["task"]);
  initTaskWorker();
  logger.success("Worker process is up and running!");
} catch (error) {
  logger.error("Failed to start worker process:", error);
  process.exit(1);
}

// Keep the process alive
process.on("SIGINT", () => {
  logger.info("Worker process shutting down...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.info("Worker process shutting down...");
  process.exit(0);
});
