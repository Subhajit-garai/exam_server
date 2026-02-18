import { Task } from "@/lib/types/types";
import { RedisProvider } from "@/lib/radisProvider";
import { network } from "@/utils/network";
import { runWorker } from "./tasks/worker-runner";

// demo structure of tasks
//  {
//   examid: 'cmjhf8pjm0003robu9zwvpa3b',
//   userid: 'cmiumchq20009jwbuf2mbvusw',
//   examtype: 'Dpp'
// }

// let CREATE_QUIZ_TASK: Task = {
//   type: "CREATE_QUIZ",
//   id: "b9437e1a-5483-4893-831a-98fb018839a6",
//   payload: {
//     quizId: 'b9437e1a-5483-4893-831a-98fb018839a6',
//     userid: 'cmiumcgir0001jwbukh9xs97h',
//     examtype: 'Quiz'
//   },
//   variant: "Quiz",
//   category: "JECA",
// };
let QUIZ_Processing_TASK: Task = {
  type: "SEND_QUIZ_DATA",
  id: "b9437e1a-5483-4893-831a-98fb018839a6",
  payload: {
    cburl: 'https://153280c08a5f.ngrok-free.app/survertask',
    userid: 7057093987,
    chatid: -1002506753144,
    platfrom: 'TELEGRAM',
    chat_type: 'supergroup'
  },
  variant: "Quiz",
  category: "JECA",
};


// let CREATE_EXAM_TASK: Task = {
//   type: "CREATE_EXAM",
//   id: "cmjgn8tmd000bn8buxruxtn1v",
//   payload: {
//     examid: "cmjgn8tmd000bn8buxruxtn1v",
//     userid: "cmiumcgir0001jwbukh9xs97h",
//     examtype: "Test",
//   },
//   variant: "Test",
//   category: "JECA",
// };

// let CREATE_SCORE: Task = {
//   type: "CREATE_SCORE",
//   id: "cmjgn8tmd000bn8buxruxtn1v",
//   payload: {
//     examid: "cmjgn8tmd000bn8buxruxtn1v",
//     userid: "cmiumcgir0001jwbukh9xs97h",
// }

// let PROCESS_Ans: Task = {
//   type: "ANS_PROCESSING",
//   id: "cmhq265in0000buu0esuysjc8",
//   payload: {
//     examid: "cmhq265in0000buu0esuysjc8",
//     userid: "cmhlkoklm0005bubkzmbxyks7",
//     part: "part1",
//     ans: ["3"],
//     ismultiple: false,
//     number: "1",
//   },
// };

const main = async () => {
  try {
    let redisClient = RedisProvider.getInstance();
    // await redisClient.push(QUIZ_Processing_TASK); // added testing

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

// process.on("SIGINT", async () => {
//   console.log("🧹 Shutting down worker...");
//   await RedisProvider.getInstance().disconnect();
//   process.exit(0);
// });

run();
