// src/workers/base-task.ts
import { Task } from "@repo/lib/types/types";

export abstract class BaseWorkerTask {
  protected maxRetries = 3;

  constructor(protected task: Task) {}

  // Each subclass must implement this
  abstract execute(): Promise<void>;

  // Wrapping run logic: retry + logging
  async run(): Promise<void> {
    const name = this.constructor.name;
    let attempts = 0;

    while (attempts < this.maxRetries) {
      try {
        console.log(`[${name}] Attempt ${attempts + 1} - Starting`);
        await this.execute();
        console.log(`[${name}] Completed successfully ✅`);
        return;
      } catch (err) {
        attempts++;
        console.error(`[${name}] Failed on attempt ${attempts}:`, err);

        if (attempts >= this.maxRetries) {
          console.error(`[${name}] ❌ Max retries reached`);
          throw err;
        }
        await new Promise(res => setTimeout(res, 1000 * attempts)); // exponential backoff
      }
    }
  }
}
