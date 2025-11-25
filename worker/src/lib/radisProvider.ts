import { Task } from "./types/types";
import Redis from "ioredis";

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
  }

  getclient() {
    return this.redisClient;
  }

  // pattern matching and get all match keys
  async scanKeys(pattern: string) {
    let cursor = "0";
    let keys: string[] = [];

    do {
      const result = await this.getclient().scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100
      );
      cursor = result[0]; // New cursor position
      keys = keys.concat(result[1]); // Append keys found
    } while (cursor !== "0"); // Loop until cursor resets

    return keys;
  }

  // task push and pop
  push(data: Task) {
    if (!this.redisClient) console.log("not cunnected....");
    let taskdata: string;
    taskdata = JSON.stringify(data);
    return this.redisClient.lpush(this.queue, taskdata);
  }

  async pop(): Promise<Task | null> {
    let rawdata = await this.redisClient.brpop([this.queue], 0);

    // if priority queue have any task then pop it first  then others
    // task:normal
    //task:high

    
    if (rawdata) {
      let data: Task = JSON.parse(rawdata[1]);
      return data;
    }
    return null;
  }

  
  // implement it  other class 


 

  // here is need ??
  
  
  
  

  async disconnect() {
    await this.redisClient.quit();
  }
}


