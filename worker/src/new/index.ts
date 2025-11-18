// import { RedisProvider } from "@/lib/radisProvider";
// import { Task } from "@/lib/types/types";
// import { network } from "@/utils/network";
// import { TaskFactoy } from "@/tasks/task-factory";

// export async function handleWorkerTask(task: Task) {
//   try {
//     const handler = TaskFactoy.create(task);
//     await handler.execute(task);
//     console.log(`✅ ${task.type} executed successfully`);
//   } catch (error) {
//     console.error(` ❌ Error processing ${task.type}`, error);
//   }
// }

// let task: Task = {
//   type: "CreateExam",

//   data: {
//     subType: "JECA",
//     examid: "cmgdk2jyd0000buzkjr0tr46l",
//     userid: "cmegpmq8d0000bug0gondntc0",
//     examtype: "Exam",
//   },
// };

// //cmbpafq590000buoonrdqgwu5

// const main = async () => {
//   try {
//     let redisClient = RedisProvider.getInstance();

//     while (true) {
//       let data = await redisClient.pop();
//       console.log("task   ----->", data);
//       if (!data) {
//         console.warn("⚠️ No task found, waiting...");
//         await new Promise((r) => setTimeout(r, 1000));
//         continue;
//       }
//       await handleWorkerTask(data);
//     }
//   } catch (error) {
//     console.log("Error processing task", error);
//     await new Promise((resolve) => setTimeout(resolve, 3000));
//   }
// };

// const run = async () => {
//   while (!network.islogin) {
//     console.log("⏳ Waiting for network login...");
//     await new Promise((r) => setTimeout(r, 1000)); // check every 500ms
//   }
//   console.log("🌐 Network ready, starting worker...");
//   await main();
// };

// process.on("SIGINT", async () => {
//   console.log("🧹 Shutting down worker...");
//   await RedisProvider.getInstance().disconnect();
//   process.exit(0);
// });

// run();















// // import { taskmanager } from "./lib/taskmanager";
// // import { Task } from "./lib/types/types";
// // import { network } from "./utils/network";

// // let task: Task = {
// //   type: "CreateExam",

// //   data: {
// //     subType: "JECA",
// //     examid: "cmgdk2jyd0000buzkjr0tr46l",
// //     userid: "cmegpmq8d0000bug0gondntc0",
// //     examtype: "Exam",
// //   },
// // };

// // //cmbpafq590000buoonrdqgwu5

// // const main = async () => {
// //   let manager = taskmanager.getInstance();

// //   // await manager.getredisClient().push(task);

// //   while (true) {
// //     try {
// //       let data = await manager.getredisClient().pop();
// //       console.log("task   ----->", data);

// //       if (data) {
// //         switch (data?.type) {
// //           case "CreateExam":
// //             await manager.handleExamCreation(data);
// //             break;
// //           case "CreateScore":
// //             await manager.handleScore(data);
// //             break;
// //           case "AnsProcessing":
// //             await manager.handleAns(data);
// //           case "createQuiz":
// //             await manager.handleQuiz(data);
// //             break;
// //           case "MockSetProcessing":
// //             await manager.ProcessMockset(data);
// //             break;
// //           default:
// //             console.log("unknown type task  can't be proceed");

// //             break;
// //         }
// //       }
// //     } catch (error) {
// //       console.log("Error processing task", error);
// //       await new Promise((resolve) => setTimeout(resolve, 5000));
// //     }
// //   }
// // };

// // const run = async () => {
// //   while (!network.islogin) {
// //     await new Promise((r) => setTimeout(r, 1000)); // check every 500ms
// //   }
// //   main();
// // };

// // run();

