import { taskmanager } from "./lib/taskmanager";
import { Task } from "./lib/types/types";
import { network } from "./utils/network";

// let task: Task = {
//   type: "CreateScore",
//   examid: "cme5a8tw3002vbu2waam8nukj",
//   userid: "cmbq7jf1d0000bu0s44a4r0j6",
// };

// cmbhydilg0000bu3optq3ec3a

let task: Task = {
  type: 'CreateExam',
  examid: 'cmfv52n0c0000bunkni76hza6',
  userid: 'cmegpmq8d0000bug0gondntc0',
  examtype: 'Exam'
};

//cmbpafq590000buoonrdqgwu5

const main = async () => {
  let manager = taskmanager.getInstance();

  await manager.getredisClient().push(task);

  while (true) {
    try {
      let data = await manager.getredisClient().pop();
      console.log("task   ----->", data);

      if (data) {
        switch (data?.type) {
          case "CreateExam":
            await manager.handleExamCreation(data);
            break;
          case "CreateScore":
            await manager.handleScore(data);
            break;
          case "AnsProcessing":
            await manager.handleAns(data);
          case "createQuiz":
            await manager.handleQuiz(data);
            break;
          case "MockSetProcessing":
            await manager.ProcessMockset(data);
            break;
          default: console.log("unknown type task  can't be proceed");
          
            break;
        }
      }
    } catch (error) {
      console.log("Error processing task", error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

const run = async () => {
  while (!network.islogin) {
    await new Promise((r) => setTimeout(r, 1000)); // check every 500ms
  }
  main();
};


run();
