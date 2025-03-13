import {  taskmanager } from "./lib/taskmanager";
import { Task } from "./lib/types/types";

// let task:Task = {
//   type: 'CreateScore',
//   examid: 'cm7slsupr000vbu2cbckyeg1e',
//   userid: 'cm7slsumw0005bu2cdrcgvwbf'
// }
const main = async () => {
  let manager = taskmanager.getInstance()
  // await manager.getredisClient().push(task)
  while (true) {    
    try {
      let data = await manager.getredisClient().pop();
      console.log("task   ----->",data);
    
    if (data) {
      switch (data?.type) {
        case "CreateExam": await manager.handleExam(data)
          break;
        case "CreateScore":  await manager.handleScore(data)
          break;
        case "AnsProcessing": await  manager.handleAns(data)
          break;
        default: 
          break;
      }
    }
    } catch (error) {
      console.log("Error processing task",error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

};



main();
