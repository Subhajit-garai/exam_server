import { Task } from "./types/types";
import Redis from "ioredis";

export class RedisProvider {
  private static instance: RedisProvider;
  private redisClient:Redis ;
  private queue: string = "task";
  StoerPrefix: string = "ans";


  public static getInstance() {
    if (!this.instance) {
      this.instance = new RedisProvider();
    }
    return this.instance;
  }

  private constructor() {

  this.redisClient = new Redis(process.env.REDIS_URL as string)
  
  this.redisClient.on('error', err => console.log('Redis Client Error', err));
  
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

    let rawdata = await this.redisClient.brpop([this.queue],0);    
    
    if (rawdata) {
      let data: Task = JSON.parse(rawdata[1]);
      return data;
    }
    return null;
  }

  set(data: Task,EX:number = 0) {
    if (data.type === "AnsProcessing") {
      let ansData: string;
      let { examid, userid, part, ans, id } = data;

      
      if (typeof ans != "string") {
        ansData = JSON.stringify(data);
      } else {
        ansData = ans;
      }      
      // console.log("ans str" ,`${this.StoerPrefix}:${examid}:${userid}:${part}:${id}`,"data",data);
      
      return this.redisClient.set(
        `${this.StoerPrefix}:${examid}:${userid}:${part}:${id}`,
        ansData,'EX',EX
      );
    }
  }

  async get(keys: string[]) {
    const ans = await this.redisClient.mget(keys);
    return ans ? ans : null;
  }
  
  

  async disconnect() {
    await this.redisClient.quit();
  }
}

// export class RedisStore {
//   anstable: any = {};

//   redisClient: RedisClientType;
//   // url:string ='redis://localhost:6379'

//   constructor() {
//     this.redisClient = createClient({
//       // username: process.env.REDIS_USER,
//       // password: process.env.REDIS_PASSWORD,
//       // socket: {
//       //     host: process.env.REDIS_HOST,
//       //     port: parseInt(process.env.REDIS_PORT as string),
//       // },
//       url: process.env.REDIS_URL,
//       pingInterval: 3000,
//     });

//     this.redisClient.on("error", (err) =>
//       console.log("Redis Client  Error in RedisStore", err)
//     );

//     this.redisClient.connect();
//   }

//   /*
//     {
//       examid:{
//       userid:{
//       part:{
//       23:"1"
//       },
//       part:{
//       12:"2"
//       }
//       }
//       }
//     }
//     */

//   addans(data: any) {
//     let { userid, examid, part, numer, ans } = data;
//     this.anstable[examid][userid][part][numer] = ans;
//   }

//   printanstable() {
//     console.log(this.anstable);
//   }
// }

// export class RedisAnshendler {
//   redisClient: RedisClientType;
//   StoerPrefix: string = "ans";

//   constructor() {
//     this.redisClient = createClient({
//       // username: process.env.REDIS_USER,
//       // password: process.env.REDIS_PASSWORD,
//       // socket: {
//       //     host: process.env.REDIS_HOST,
//       //     port: parseInt(process.env.REDIS_PORT as string),
//       // },
//       url: process.env.REDIS_URL,
//       pingInterval: 3000,
//     });

//     this.redisClient.on("error", (err) =>
//       console.log("Redis Client Error in RedisAnshendler", err)
//     );

//     this.redisClient.connect();
//   }
//   getclient() {
//     return this.redisClient;
//   }

//   set(data: Task) {
//     if (data.type === "AnsProcessing") {
//       let ansData: string;
//       let { examid, userid, part, ans, id } = data;
//       if (typeof ans != "string") {
//         ansData = JSON.stringify(data);
//       } else {
//         ansData = ans;
//       }
//       return this.redisClient.set(
//         `${this.StoerPrefix}:${examid}:${userid}:${part}:${id}`,
//         ansData
//       );
//     }
//   }

//   async get(keys: string[]) {
//     const ans = await this.redisClient.mGet(keys);
//     return ans ? ans : null;
//   }

//   async disconnect() {
//     await this.redisClient.quit();
//   }
// }
