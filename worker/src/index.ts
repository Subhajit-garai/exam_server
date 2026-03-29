import { Task } from "@/lib/types/types.js";
import { RedisProvider } from "@/lib/radisProvider.js";
import { runWorker } from "./tasks/worker-runner.js";
import { logger } from "./utils/logger.js";
import "dotenv/config";

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
//     quizId: '3cad3ae6-eff6-4f17-bb6a-2491abc5af81',
//     userid: 'cmiumcgir0001jwbukh9xs97h',
//     examtype: 'Quiz'
//   },
//   variant: "Quiz",
//   category: "JECA",
// };


// let QUIZ_Processing_TASK: Task = {
//   type: "SEND_QUIZ_DATA",
//   id: "b9437e1a-5483-4893-831a-98fb018839a6",
//   payload: {
//     cburl: 'https://153280c08a5f.ngrok-free.app/survertask',
//     userid: 7057093987,
//     chatid: -1002506753144,
//     platfrom: 'TELEGRAM',
//     chat_type: 'supergroup'
//   },
//   variant: "Quiz",
//   category: "JECA",
// };


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
    logger.info("Worker started");
    let redisClient = RedisProvider.getInstance();
    // await redisClient.push(CREATE_QUIZ_TASK); // added testing

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


// process.on("SIGINT", async () => {
//   console.log("🧹 Shutting down worker...");
//   await RedisProvider.getInstance().disconnect();
//   process.exit(0);
// });

main();
