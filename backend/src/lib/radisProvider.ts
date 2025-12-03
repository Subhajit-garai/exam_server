import Redis from "ioredis";

import { Task } from "./types.js";

export class RedisProvider {
  private static instance: RedisProvider;
  private redisClient: Redis;
  private queue: string = "task";

  public static getInstance() {
    if (!this.instance) {
      this.instance = new RedisProvider();
    }
    return this.instance;
  }

  private constructor() {

    this.redisClient = new Redis(process.env.REDIS_URL as string);

    this.redisClient.on("error", (err) =>
      console.log("Redis Client Error", err)
    );

    // this.redisClient.connect();
  }

  getclient(): Redis {
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

  set(id: string, data: any) {
    let taskdata: string;
    taskdata = JSON.stringify(data);
    this.redisClient.set(`question:${id}`, taskdata, "EX", 86400, "XX", (err, success) => {
      if (err) {
        console.error("Redis SETXX Error:", err);
      }

      if (!success) {
        this.redisClient.set(`question:${id}`, taskdata, "EX", 86400, "NX")
      }
    })

  }

  async get(id: string) {
    const question = await this.redisClient.get(`question:${id}`);
    return question ? JSON.parse(question) : null;
  }

  async disconnect() {
    await this.redisClient.quit();
  }
}

