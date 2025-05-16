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

    if (rawdata) {
      let data: Task = JSON.parse(rawdata[1]);
      return data;
    }
    return null;
  }
  // End task push and pop

  // ans set and get
  setUserans(data: Task, EX: number = 0) {
    const StoerPrefix: string = "ans";

    if (data.type === "AnsProcessing") {
      let ansData: string;
      let { examid, userid, part, ans, id, ismultiple } = data;

      if (typeof ans != "string") {
        // ansData = JSON.stringify(ansdata);
        if (ismultiple) {
          ansData = ans.join(",");  // multiple ans ["1","2","3"]  --> "1,2,3"
        } else {
          ansData = ans[0]; // single ans 
        }
      } else {
        ansData = ans;
      }
      // console.log("ans str" ,`${this.StoerPrefix}:${examid}:${userid}:${part}:${id}`,"data",data);

      return this.redisClient.set(
        `${StoerPrefix}:${examid}:${userid}:${part}:${id}`,
        ansData,
        "EX",
        EX
      );
    }
  }

  async getUserans(examid: string, userid: string) {
    let key = `${"ans"}:${examid}:${userid}:*`;
    let keys = await this.scanKeys(key);
    if (keys.length > 0) {
      const values = await this.redisClient.mget(keys);

      /* [ { cm5nywh32003gbu5gbivsjwfk: { ans: null, part: 'part1' } ]*/

      const ans_array = keys.map((key, index) => {
        let keyArr = key.split(":");
        let questionid = keyArr[4];
        let part = keyArr[3];
        let ans = values[index];
        return {
          [questionid]: { ans: ans, part: part },
        };
      });

      /*  { cm5nywh32003gbu5gbivsjwfk: { ans: null, part: 'part1' } , {} }*/

      const ans = keys.reduce<Record<string, { ans: string; part: string }>>(
        (acc, key, index) => {
          const keyArr = key.split(":");
          const questionid = keyArr[4];
          const part = keyArr[3];
          let answer = values[index];

          if (answer === null) {
            answer = "null";
          }

          if (questionid) {
            acc[questionid] = { ans: answer, part: part };
          }

          return acc;
        },
        {}
      );
      // console.log("ans", ans);

      return [ans, ans_array];
    }
  }
  // async getans(keys: string[]) {
  //   const ans = await this.redisClient.mget(keys);
  //   return ans ? ans : null;
  // }

  // end ans set and get

  // set and get ExamPattern

  async setExamPattern(data: any, examid: string, EX: number = 0) {
    const StoerPrefix: string = "ExamPattern";
    let ansSheetData: string;
    ansSheetData = JSON.stringify(data);

    return this.redisClient.set(
      `${StoerPrefix}:${examid}`,
      ansSheetData,
      "EX",
      EX,
      "NX"
    );
  }
  async getExamPattern(examid: string) {
    const StoerPrefix: string = "ExamPattern";
    let key = `${StoerPrefix}:${examid}`;
    let data = await this.redisClient.get(key);

    return data ? data : null;
  }
  // end set and get ansSheet

  // set and get ansSheet

  async setAnsSheet(
    data: {
      id: string;
      examid: string;
      ans: any;
      status: string;
    }[],
    examid: string,
    EX: number = 0
  ) {
    const StoerPrefix: string = "AnsSheet";
    let ansSheetData: string;
    ansSheetData = JSON.stringify(data);

    return this.redisClient.set(
      `${StoerPrefix}:${examid}`,
      ansSheetData,
      "EX",
      EX,
      "NX"
    );
  }
  async getAnsSheet(examid: string) {
    const StoerPrefix: string = "AnsSheet";
    let key = `${StoerPrefix}:${examid}`;
    let data = await this.redisClient.get(key);

    return data ? data : null;
  }
  // end set and get ansSheet

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
