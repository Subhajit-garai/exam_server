import { Redis } from "ioredis";
import { Task } from "@/lib/types/types.js";
import { logger } from "@/utils/logger.js";
import { Queue, JobsOptions } from "bullmq";

export class QueueManager<Q extends string = string> {
  private static instance: QueueManager<any>;
  private redisClient: InstanceType<typeof Redis>;
  private queues: Map<string, Queue> = new Map();
  private allowedQueues: Q[] = [];

  public static getInstance<T extends string = string>(allowedQueues?: T[]): QueueManager<T> {
    if (!this.instance) {
      this.instance = new QueueManager<T>(allowedQueues || (["task"] as T[]));
    } else if (allowedQueues) {
      // Update allowed queues if passed again
      const newQueues = Array.from(new Set([...this.instance.allowedQueues, ...allowedQueues]));
      this.instance.allowedQueues = newQueues;
    }
    return this.instance as QueueManager<T>;
  }

  private constructor(allowedQueues: Q[]) {
    this.allowedQueues = allowedQueues;
    this.redisClient = new Redis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: null,
    });
    this.redisClient.on("error", (err: Error) =>
      logger.error("[Queue] Redis Client Error", err)
    );
  }

  /**
   * Get the Redis connection used for queues
   */
  getclient(): InstanceType<typeof Redis> {
    return this.redisClient;
  }

  /**
   * Get or create a BullMQ queue
   */
  public getQueue<T = any>(queueName: Q): Queue<T> {
    if (!this.allowedQueues.includes(queueName)) {
      throw new Error(`[Queue] Access denied: Queue "${queueName}" is not in the allowed list.`);
    }

    if (!this.queues.has(queueName)) {
      const queue = new Queue<T>(queueName, {
        connection: this.redisClient,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 1000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      });
      this.queues.set(queueName, queue);
      logger.info(`[Queue] Queue initialized: ${queueName}`);
    }
    return this.queues.get(queueName) as Queue<T>;
  }

  /**
   * Add a job to a specific queue
   */
  async addJob<T = any>(
    queueName: Q,
    jobName: string,
    data: T,
    options?: JobsOptions
  ) {
    try {
      const queue = this.getQueue<T>(queueName);
      const job = await queue.add(jobName as any, data as any, options);
      logger.info(`[Queue] Job added to ${queueName}: ${jobName} (${job.id})`);
      return job;
    } catch (err) {
      logger.error(`[Queue] Failed to add job to queue ${queueName}:`, err);
      throw err;
    }
  }

  /**
   * Delete a job from a specific queue
   */
  async deleteJob(queueName: Q, jobId: string) {
    try {
      const queue = this.getQueue(queueName);
      const job = await queue.getJob(jobId);
      if (job) {
        await job.remove();
        logger.info(`[Queue] Job ${jobId} removed from queue ${queueName}`);
        return true;
      }
      return false;
    } catch (err) {
      logger.error(`[Queue] Failed to delete job from queue ${queueName}:`, err);
      throw err;
    }
  }

  /**
   * Legacy method maintained for backward compatibility
   * Pushes to the default "task" queue
   */
  async push(data: Task) {
    return this.addJob("task" as Q, data.type, data);
  }

  /**
   * Graceful disconnect
   */
  async disconnect() {
    for (const queue of this.queues.values()) {
      await queue.close();
    }
    await this.redisClient.quit();
  }
}
