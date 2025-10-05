import prisma from "../../db/index";
import { Questions_type, Task } from "../types";
import { waitForSomeThink } from "../helper/delay";
import { CreationTypes } from "@prisma/client";
import _ from "lodash";
import { debuglog } from "../helper/debugLog";
import { examManager } from "../examManager";
const em = examManager.getInstance();

export const MockSetProcessingStatus = async (
  id: string,
  data?: CreationTypes,
  action: "UPDATE" | "CHECK" = "CHECK"
): Promise<CreationTypes | null> => {
  let mockSet;

  switch (action) {
    case "UPDATE":
      mockSet = await prisma.mock_questions_set.update({
        where: { id },
        data: {
          status: data,
        },
        select: {
          status: true,
        },
      });

      break;

    default:
      mockSet = await prisma.mock_questions_set.findFirst({
        where: { id },
        select: {
          status: true,
        },
      });
      break;
  }

  return (mockSet && mockSet?.status) ?? null;
};

export const ProcessMockSet = async (id: string, action: string) => {
  let data: Task = {
    type: "MockSetProcessing",
    mockid: id,
    action: action,
  };
   em.getredisclient().push(data);  // create a queue 
};

// export const ProcessMockSet = async (id: string, action: string) => {
//   let questionCount: number[] = [];
//   let parts = [];
//   let ismultiple_part = false;
//   let Mock_Questions: Questions_type = {};
//   let difficulty_count = { Easy: 0, Medium: 0, Hard: 0 };
//   let topic_wise_count: { [key: string]: number } = {}; //{ "OS": 0, "DBMS": 0, "C": 0 }
//   let question_part_count: { [key: string]: number } = {}; // { "part1": 0, "part2": 0 }
//   let isprocessingDone = false;
//   let MockSet_Status: CreationTypes = "Suspended";
//   let isError = false; // if error true then status suspended

//   const mockSet = await prisma.mock_questions_set.update({
//     where: { id },
//     data: {
//       status: "Processing",
//     },
//   });

//   if (mockSet) {

//     let exam_pattern_info = await prisma.exam_pattern.findFirst({
//       where: {
//         title: mockSet.pattern as string,
//       },
//       select: {
//         topics: true,
//         total_questions: true,
//       },
//     });

//     if (!exam_pattern_info) {
//       return new Error("exam_pattern_info not found");
//     }

//     // questions

//     // let MockSetQuestion = await prisma.question_map.findMany({
//     //   where: {
//     //     examid: mockSet.id,
//     //   },
//     // });

//     let MockSetQuestion = await prisma.mock_question_map.findMany({
//       where: {
//         mockid: mockSet.id,
//       },
//     });

//     // question count checking
//     if (!MockSetQuestion) return new Error("questions not found in mock set");

//     MockSetQuestion.map((questionInfo) => {
//       if (!Mock_Questions[questionInfo.part])
//         Mock_Questions[questionInfo.part] = [];

//       Mock_Questions[questionInfo.part].push(questionInfo.questionid);
//     });

//     // Mock_Questions = mockSet?.questions as Questions_type;

//     if (exam_pattern_info?.total_questions.length > 1) {
//       // is pattern have multiple parts
//       if (!(Object.keys(Mock_Questions).length > 1)) {
//         throw new Error(
//           `Exam pattern have multiple part , but current mock set doesnot have multiple part . part length is --->${
//             Object.keys(Mock_Questions).length
//           }`
//         );
//       }

//       ismultiple_part = true;
//     }

//     // setting part info
//     parts = Object.keys(Mock_Questions);

//     for (const part of parts) {
//       debuglog("loop1");
//       let questions = Mock_Questions[part];
//       // done

//       if (questions.length > 0) {

//         let questionFullInfo = await prisma.questions.findMany({
//           where: {
//             id: {
//               in: questions,
//             },
//           },
//           select: {
//             id: true,
//             title: true,
//             topic: true,
//             difficulty: true,
//             sub_topic: true,
//             explanation: true,
//             is_multiple_ans: true,
//             status: true,
//           },
//         });

//         questionFullInfo.map((question) => {

//           if (!question_part_count[part]) {
//             question_part_count[part] = 0;
//           }
//           question_part_count[part] += 1;

//           if (question.difficulty) {
//             difficulty_count[question.difficulty] += 1;
//           }
//           if (question.topic) {
//             if (!topic_wise_count[question.topic]) {
//               topic_wise_count[question.topic] = 0;
//             }
//             topic_wise_count[question.topic] += 1;

//             // check other topic not added
//             if (!exam_pattern_info.topics.includes(question.topic)) {
//               isError = true;
//               console.log("unkown topic found in mock set question ....");
//             }
//           }
//         });
//         questionCount.push(question_part_count[part]);
//       }
//     }

//     // comparing the mock set info count

//     exam_pattern_info?.total_questions.map((num, index) => {
//       debuglog("loop3");

//       if (num !== questionCount[index]) {
//         console.error("question count is not matching for", index + 1);
//       } else {
//         console.log("question count is matching for", index + 1);
//       }
//     });

//     isprocessingDone = true;

//     await waitForSomeThink(() => {
//       console.log("=====> ", isprocessingDone);
//       return isprocessingDone;
//     }, 3);

//     console.log("questionCount is ", questionCount);
//     console.log("question_part_count is ", question_part_count);
//     console.log("topic_wise_count is ", topic_wise_count);
//     console.log("difficulty_count is ", difficulty_count);

//     // all  topic added of not
//     if (
//       !_.isEqual(
//         [...exam_pattern_info.topics].sort(),
//         Object.keys(topic_wise_count).sort()
//       )
//     ) {
//       console.log("---- topic ----> ", [...exam_pattern_info.topics].sort());
//       console.log("----  ----> ", topic_wise_count);
//       console.log("----  ----> ", Object.keys(topic_wise_count).sort());

//       console.log("In mock set's some topic's questions are not present  .. ");
//       isError = true;
//     }
//     // check if all topic question are add at list one
//     if (!Object.values(topic_wise_count).every((val) => val >= 1)) {
//       console.log(
//         " In mock set's some topic is empty add at leat 1 question per topic .. "
//       );
//       isError = true;
//     }

//     // check question count
//     if (!_.isEqual(exam_pattern_info.total_questions, questionCount)) {
//       console.log("mock set's question count is not equel .. ");
//       isError = true;
//     }

//     // if those checks are ok , then add status : done

//     // store data
//     console.log(" error ---->", isError);

//     if (!isError) {
//       MockSet_Status = "Done";

//       // let response = await prisma.exam.findMany({
//       //   where: {
//       //     mockSetId: mockSet.id,
//       //   },
//       //   select: {
//       //     id: true,
//       //     created_by: true,
//       //     examtype: true,
//       //   },
//       // });

//       //   // send it into queue to process question
//       // response.map(async (exam) => {
//       //   // let { id } = response;
//       //   // await em.getredisclient().push({  // here
//       //   //   type: "CreateExam", // createExam  --->  processMock questions
//       //   //   examid: exam.id,
//       //   //   userid: exam.created_by as string,
//       //   //   examtype: exam.examtype,
//       //   // });
//       // });

//       // exam process done
//     }

//         // need to add task for ording question --> when all question is add and then add task to order and then update status of mock

//     const UpdatedmockSet = await prisma.mock_questions_set.update({
//       where: { id },
//       data: {
//         question_part_count: question_part_count,
//         status: MockSet_Status,
//         question_topic_count: topic_wise_count,
//         selected_questions_count: questionCount,
//         question_difficulty_weight: difficulty_count,
//       },
//     });

//     if (UpdatedmockSet) {
//       console.log("completed   ...");
//     }
//   } else {
//     throw new Error("mock set not found");
//   }
// };
