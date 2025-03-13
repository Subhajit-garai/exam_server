import Redis from "ioredis";

import { Task } from "./types";

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

  getclient() {
    return this.redisClient;
  }

  push(data: Task) {
    if (!this.redisClient) console.log("not cunnected....");

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
    return this.redisClient.set(`question:${id}`, taskdata, "EX", 86400, "NX");

  }

  async get(id: string) {
    const question = await this.redisClient.get(`question:${id}`);
    return question ? JSON.parse(question) : null;
  }

  async disconnect() {
    await this.redisClient.quit();
  }
}

// export class RedisQueueProvider<T> {
//   // private static instance:RedisQueueProvider;
//   // private redisClient:RedisClientType;
//   redisClient: RedisClientType;
//   queue: string = "";
//   // url:string ='redis://localhost:6379'

//   constructor(name: string) {
//     this.queue = name;
//     this.redisClient = createClient({
//       // username: 'subho',
//       // password: 'Subhajit@Redis@2002',
//       // socket: {
//       //     host: 'redis-10745.c305.ap-south-1-1.ec2.redns.redis-cloud.com',
//       //     port: 10745
//       // }
//       url:process.env.REDIS_URL
//   });

//   this.redisClient.on('error', err => console.log('Redis Client Error in RedisQueueProvider', err));

//   this.redisClient.connect();
//     console.log("connected ....");
//   }

//   // public static getInstance(){
//   //   if(!this.instance){
//   //     this.instance = new RedisQueueProvider();
//   //   }
//   //   return this.instance
//   // }

//   push(data: T) {
//     if (!this.redisClient) console.log("not cunnected....");

//     let taskdata: string;
//     taskdata = JSON.stringify(data);
//     return this.redisClient.lPush(this.queue, taskdata);
//   }

//   async pop(): Promise<T | null> {
//     let rawdata = await this.redisClient.rPop(this.queue);
//     if (rawdata) {
//       let data: T = JSON.parse(rawdata as string);
//       return data;
//     }
//     return null;
//   }

//   async disconnect() {
//     await this.redisClient.quit();
//   }
// }
