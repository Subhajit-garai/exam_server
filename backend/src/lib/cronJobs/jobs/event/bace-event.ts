import { logger } from "@repo/lib/helper/logger.js";
// src/workers/base-task.ts

import { events } from "@/lib/types/EventTypes.js";

export abstract class BaseEvent {
  protected maxRetries = 3;

  constructor(protected event: events) { }

  // Each subclass must implement this 
  // push -> push as a task in task queue with priority
  abstract push(): Promise<void>;

  // Wrapping run logic: retry + logging
  async run(): Promise<void> {
    const name = this.constructor.name;
    let attempts = 0;

    while (attempts < this.maxRetries) {
      try {
        logger.info(`[${name}] Attempt ${attempts + 1} - Starting`);
        await this.push();
        logger.info(`[${name}] Completed successfully ✅`);
        return;
      } catch (err) {
        attempts++;
        logger.error(`[${name}] Failed on attempt ${attempts}:`, err);

        if (attempts >= this.maxRetries) {
          logger.error(`[${name}] ❌ Max retries reached`);
          throw err;
        }
        await new Promise(res => setTimeout(res, 1000 * attempts)); // exponential backoff
      }
    }
  }
}
