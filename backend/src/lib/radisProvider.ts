import { Redis } from "ioredis";

import { Task } from "./types.js";

export class RedisProvider {
  private static instance: RedisProvider;
  private redisClient: InstanceType<typeof Redis>;
  private queue: string = "task";

  public static getInstance() {
    if (!this.instance) {
      this.instance = new RedisProvider();
    }
    return this.instance;
  }

  private constructor() {

    this.redisClient = new Redis(process.env.REDIS_URL!);
    this.redisClient.on("error", (err: Error) =>
      console.log("Redis Client Error", err)
    );

  }

  getclient(): InstanceType<typeof Redis> {
    return this.redisClient;
  }

  push(data: Task) {
    if (!this.redisClient) console.log("not connected....");
    let taskdata: string;
    taskdata = JSON.stringify(data);
    return this.redisClient.lpush(this.queue, taskdata);
  }

  async pop(): Promise<Task | null> {
    let rawdata = await this.redisClient.rpop(this.queue);
    if (rawdata) {
      let data: Task = JSON.parse(rawdata as string);
      return data;
    }
    return null;
  }

  async set(id: string, data: any): Promise<void> {
    const taskdata = JSON.stringify(data);
    const key = `question:${id}`;
    try {
      // Update only if key already exists (XX), with 24h TTL
      const result = await this.redisClient.set(key, taskdata, "EX", 86400, "XX");
      if (!result) {
        // Key didn't exist yet — create it (NX), with 24h TTL
        await this.redisClient.set(key, taskdata, "EX", 86400, "NX");
      }
    } catch (err) {
      console.error("Redis SET Error:", err);
    }
  }

  async get(id: string) {
    const question = await this.redisClient.get(`question:${id}`);
    return question ? JSON.parse(question) : null;
  }

  async disconnect() {
    await this.redisClient.quit();
  }
}

