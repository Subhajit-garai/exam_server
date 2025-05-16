import { taskmanager } from "./lib/taskmanager";
import { Task } from "./lib/types/types";

//  let task:Task = {
//   type: 'CreateExam',
//   examid: 'cmaj5ykli0006buocxc3pu77r',
//   userid: 'cm9g0rrga0000bunsg983g82f'
// }

const main = async () => {
  let manager = taskmanager.getInstance();

  // await manager.getredisClient().push(task)
 

  while (true) {
    try {
      let data = await manager.getredisClient().pop();
      console.log("task   ----->", data);

      if (data) {
        switch (data?.type) {
          case "CreateExam":
            await manager.handleExam(data);
            break;
          case "CreateScore":
            await manager.handleScore(data);
            break;
          case "AnsProcessing":
            await manager.handleAns(data);
          case "createQuiz":
            await manager.handleQuiz(data);
            break;
          default:
            break;
        }
      }
    } catch (error) {
      console.log("Error processing task", error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

main();




// calculate exam score  
// case 1 --> no neg incorect (all are right)
// --> fine when all are correct p1 -> 5/5 p2- 5/5 - score -> 5 + 10 = 15 correct
// RIGHT_WRONG { part1: { Right: 5, Wrong: 0 }, part2: { Right: 5, Wrong: 0 } }
// 15 score , 0 wrong ,10 right

// case 2 -> (p1  -> some wrong (neg mark calculate))
/*
RIGHT_WRONG { part1: { Right: 3, Wrong: 2 } }
RIGHT_WRONG_subject {
  OS: { Right: 1, Wrong: 0 },
  DBMS: { Right: 1, Wrong: 1 },
  UNIX: { Right: 1, Wrong: 0 },
  COMPUTER: { Right: 0, Wrong: 1 }
}
RIGHT_WRONG { part1: { Right: 3, Wrong: 2 }, part2: { Right: 5, Wrong: 0 } }
RIGHT_WRONG_subject {
  OS: { Right: 2, Wrong: 0 },
  DBMS: { Right: 2, Wrong: 1 },
  UNIX: { Right: 2, Wrong: 0 },
  COMPUTER: { Right: 2, Wrong: 1 }
}
12.5 score , 2 wrong ,8 right  --> correct 
*/

// case 3 -- part2 worng   --> incorrect 

/* 
RIGHT_WRONG { part1: { Right: 5, Wrong: 0 } }
RIGHT_WRONG_subject {
  OS: { Right: 1, Wrong: 0 },
  DBMS: { Right: 1, Wrong: 0 },
  UNIX: { Right: 1, Wrong: 0 },
  COMPUTER: { Right: 2, Wrong: 0 }
}
RIGHT_WRONG { part1: { Right: 5, Wrong: 0 }, part2: { Right: 2, Wrong: 3 } }
RIGHT_WRONG_subject {
  OS: { Right: 2, Wrong: 0 },
  DBMS: { Right: 1, Wrong: 1 },
  UNIX: { Right: 2, Wrong: 1 },
  COMPUTER: { Right: 2, Wrong: 1 }
}
6 score , 3 wrong ,7 right

part1->  5 

part2 -> 6-5 =  1 but it will be 2*2 =4 

score will be 5+4  = 9 

  case 1 -> 2*2/0/1

*/
