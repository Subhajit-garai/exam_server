import { Task } from "@/lib/types/types";
import { RedisProvider } from "@/lib/radisProvider";
import { network } from "@/utils/network";
import { runWorker } from "./tasks/worker-runner";

//cmbpafq590000buoonrdqgwu5

let CREATE_EXAM_TASK: Task = {
  type: "CREATE_EXAM",
  id: "cmiebk9nz005gbuz45k4km3oi",
  payload: {
    examid: "cmiebk9nz005gbuz45k4km3oi",
    userid: "cmicprsee000abue43mtu3dwg",
    examtype: "Test",
  },
  variant: "Test",
  category: "JECA",
};

// let RUN_QUIZ: Task = {
//   type: "",
//   id: "cmhuo1jia0002buh43og57hek",
//   payload: {
//     cburl: "https://7e5afa2c0330.ngrok-free.app/survertask",
//     userid: 1192445803,
//     chatid: -1002314879281,
//     platfrom: "TELEGRAM",
//     chat_type: "supergroup",
//   },
// };

let CREATE_SCORE: Task = {
  type: "CREATE_SCORE",
  id: "cmhuo1jia0002buh43og57hek",
  payload: {
    examid: "cmhuo1jia0002buh43og57hek",
    userid: "cmhsr86zy0005buro0pgdp9lf",
  },
};

let PROCESS_Ans: Task = {
  type: "ANS_PROCESSING",
  id: "cmhq265in0000buu0esuysjc8",
  payload: {
    examid: "cmhq265in0000buu0esuysjc8",
    userid: "cmhlkoklm0005bubkzmbxyks7",
    part: "part1",
    ans: ["3"],
    ismultiple: false,
    number: "1",
  },
};

const main = async () => {
  try {
    let redisClient = RedisProvider.getInstance();
    // await redisClient.push(CREATE_EXAM_TASK); // added testing
    while (true) {
      let data = await redisClient.pop();
      if (!data) {
        console.warn("⚠️ No task found, waiting...");
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      await runWorker(data); // worker entrypoint
    }
  } catch (error) {
    console.log("Error processing task", error);
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
};

const run = async () => {
  while (!network.islogin) {
    console.log("⏳ Waiting for network login...");
    await new Promise((r) => setTimeout(r, 1000)); // check every 500ms
  }
  console.log("🌐 Network ready, starting worker...");
  await main();
};

process.on("SIGINT", async () => {
  console.log("🧹 Shutting down worker...");
  await RedisProvider.getInstance().disconnect();
  process.exit(0);
});

run();
