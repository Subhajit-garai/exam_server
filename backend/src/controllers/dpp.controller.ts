// import dayjs from "dayjs";
// import { examManager } from "../../lib/examManager";
// import prisma from "../../db";
// import { SubmitedQuestionAnsZodSchema } from "../zod/question.zod";

// const em = examManager.getInstance();

// export type dpp_type = {
//   title: string;
//   topics: string[];
//   total_question: number ,
//   created_by: string;
//   end_time: string;
//   examname: string;
//   category: string;
// };

// export const createDpp = async (data: dpp_type) => {
//   let { title, topics, created_by, end_time ,total_question ,category , examname } = data;
//   let dpp = await prisma.dpp.create({
//     data: {
//       title: title,
//       topics: topics,
//       questions: {},
//       created_by: created_by,
//       examname:examname,
//       category:category,
//       total_question:total_question,
//       end_time: end_time ?? "24 h",
//     },
//   });

//   if(dpp){
//     // send notification

//     await em.getredisclient().push({
//         type: "CreateDpp",
//         totalQuetions:total_question,
//         topics: topics
//       });
    
//     return true
//   }

//   return false;
// };

// function isDppOpen(exam: { date: Date; starttime?: string  ,endtime?: string}) {
//   const now = dayjs();
//   const timeString = exam.starttime || "08:00 pm";

//   // Combine date + time
//   const examStart = dayjs(
//     `${dayjs(exam.date).format("YYYY-MM-DD")} ${timeString}`,
//     "YYYY-MM-DD hh:mm a"
//   );
//   if(exam?.endtime) return 
//   const examEnd = examStart.add(parseInt(exam?.endtime as string) ?? 24, "hour");

//   return now.isAfter(examStart) && now.isBefore(examEnd);
// }

// export const examJoinRequestProcess = async (req: any, res: any) => {
//   try {
//     let dppid = req.query.id;
//     let userid = req.user;

//     let isUserVerified = await prisma.user.findFirst({
//       where: { id: userid },
//       select: {
//         verification: {
//           select: {
//             telegram: true,
//             email: true,
//             whatsapp: true,
//           },
//         },
//       },
//     });

//     if (
//       !(
//         isUserVerified?.verification?.email &&
//         isUserVerified.verification.telegram
//       )
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: `The user needs to verify their account to take the given exam`,
//       });
//     }

//     let isUserGivenThisExam = await prisma.score.findFirst({
//       where: {
//         exam_id: dppid,
//         user_id: userid,
//       },
//       select: {
//         id: true,
//       },
//     });

//     // exam data

//     let exam = await prisma.dpp.findFirst({
//       where: { id: dppid },
//       select: {
//         id: true,
//         creationstatus: true,
//         start_time:true,
//         end_time:true,
//         created_at:true,
//         date:true,
//         testtype:true,
        
//       },
//     });

//     if (!exam) {
//       return res
//         .status(400)
//         .json({ success: false, message: `Can not find any exam` });
//     }

//     //check here i can able to attempt multiple times
//     // **********************************************************************************************************************4
//     // if (exam.examtype !== "Mock") {
//       // mocke exam can be given multiple times

//       if (isUserGivenThisExam && isUserGivenThisExam.id) {
//         // console.log("isUserGivenThisExam", isUserGivenThisExam);
//         console.log("user already given this dpp");
//         return res.status(400).json({
//           success: false,
//           message: `You have already taken this dpp. Please join the next one.`,
//         });
//       }
//     // }

//     // **********************************************************************************************************************

//     // transaction point 1) check user balance 2) deduct balance 3) add user to exam 4)send notification

//     if (exam.creationstatus === "Done") {
//      if( !isDppOpen({ date:exam.date ,starttime: exam.start_time , endtime:exam.end_time})){
//         return  new Error(" dpp is over or not started  ")
//      }
//       // if user is prima then pass
//       let primestatus = await prisma.prime.findFirst({
//         where: {
//           userid: req.user,
//         },
//         select: {
//           status: true,
//         },
//       });

//       // create a function to gave access prime user

//       // let isaccessable =  await checkFreaureIsAccableForthisUser(primestatus?.status , req.user) // complete this

//       // if accessable the skip blance dudaction
//       // transtion begine
//       let transaction = await prisma.$transaction(async (tx: any) => {
//         // here get entry charge for exam , mock and contest subject
//         const allamount = await tx.entryChargeList.findFirst({
//           select: {
//             // exam: true,
//             // mock: true,
//             // contest: true,
//             // subject: true,
//             dpp: true,
//             quiz: true,
//             subject: true,
//           },
//         });

//         let charge = 0;

//         switch (exam.testtype) {
//           case "Dpp":
//             charge = allamount?.dpp ?? 2;
//             break;
//           case "Subject":
//             charge = allamount?.subject ?? 2;
//             break;
//           default:
//             charge = 2;
//         }

//         if (!charge && typeof charge != "number") {
//           throw new Error("invalid  balance");
//         }

//         const userdata = await tx.user.findUnique({
//           where: { id: userid },
//           select: {
//             blance: {
//               select: {
//                 amount: true,
//               },
//             },
//           },
//         });

//         if (!userdata?.blance) {
//           throw new Error("userdata not found");
//         }
//         // Step 2: Check if the balance is sufficient
//         if (userdata?.blance.amount < charge) {
//           throw new Error("Insufficient balance");
//         }

//         let user_blance = await tx.blance.update({
//           where: {
//             userid: userid,
//           },
//           data: {
//             amount: {
//               decrement: charge,
//             },
//           },
//           select: {
//             amount: true,
//           },
//         });

//         if (user_blance) {
//           return true;
//         }

//         return false;
//       });

//       if (transaction) {
//         // exam set up begine

//         // check exam is type of  mock  , if mock  then point exam question set to  mocke exam set

//         let data: { questions: any } | null = { questions: {} };

//         // switch (exam.examtype) {
//         //   // case "Exam":
//         //   //   break;
//         //   case "Mock":
//         //     // colect question from mock exam set
//         //     if (exam?.mockSetId == null) {
//         //       throw new Error("Mock exam does not have any mock set.");
//         //     }
//         //     let mock_questions_set_status =
//         //       await prisma.mock_questions_set.findFirst({
//         //         where: {
//         //           id: exam?.mockSetId,
//         //         },
//         //         select: {
//         //           status: true,
//         //         },
//         //       });
//         //     if (mock_questions_set_status?.status === "Done") {
//         //       data = await prisma.mock_questions_set.findFirst({
//         //         where: {
//         //           id: exam?.mockSetId,
//         //         },
//         //         select: {
//         //           questions: true,
//         //         },
//         //       });
//         //     } else {
//         //       throw new Error("Mock exam set is not ready yet.");
//         //     }

//         //     break;
//         //   // case "Contest":
//         //   //   charge = allamount?.contest ?? 2;
//         //   //   break;
//         //   // case "Subject":
//         //   //   charge = allamount?.subject ?? 2;
//         //   //   break;
//         //   default:
//         //     data = await prisma.exam.findFirst({
//         //       where: { id: examid },
//         //       select: {
//         //         questions: true,
//         //       },
//         //     });

//         //     if (!data) {
//         //       throw new Error("Exam not found");
//         //     }
//         // }

//         data = await prisma.dpp.findFirst({
//             where: { id: exam.id },
//             select: {
//               questions: true,
//             },
//           });

//           if (!data) {
//             throw new Error("Exam not found");
//           }

//         if (data) {
//           em.addexam(exam.id, data); // create for dpp
//           console.log("date added into exam manager");
//           em.user.adduser(exam.id, req.user);
//           console.log("user added into exam manager");
//         }

//         // progress update
//         // switch (exam.examtype) {
//         //   // case "Exam":
//         //   //   break;
//         //   // case "Mock":
//         //   //   break;
//         //   // case "Subject":
//         //   //   charge = allamount?.subject ?? 2;
//         //   //   break;
//         //   case "Contest":
//         //     await prisma.progress.update({
//         //       where: {
//         //         userid: userid,
//         //       },
//         //       data: {
//         //         attempted: {
//         //           increment: 1,
//         //         },
//         //         attendedContest: {
//         //           increment: 1,
//         //         },
//         //       },
//         //     });
//         //     break;
//         //   default:
//         //     await prisma.progress.update({
//         //       where: {
//         //         userid: userid,
//         //       },
//         //       data: {
//         //         attempted: {
//         //           increment: 1,
//         //         },
//         //         attendedExam: {
//         //           increment: 1,
//         //         },
//         //       },
//         //     });
//         // }


//       } else {
//         return res
//           .status(400)
//           .json({ success: false, message: "Transactions Failed" });
//       }

//       res.json({
//         success: true,
//         message: `Exam setup completed`,
//         data: {
//           examid: exam.id,
//         },
//       });
//     } else {
//       throw new Error(`Exam not ready to join`);
//     }
//   } catch (error) {
//     console.log("Error in exam controller examJoinRequestProcess", error);

//     if (error instanceof Error)
//       res.status(400).json({
//         success: true,
//         message: error.message,
//       });
//   }
// };




// // export const joinedExamData = async (req: any, res: any) => {
// //   try {
// //     let examid = req.query.examid;
// //     let type = req.query.type;
// //     let number = req.query.number;
// //     let part = req.query.part;
// //     let userid = req.user;

// //     let question = await em.getquestion(type, examid, userid, part, number);

// //     if (!question) {
// //       return res.status(400).json({
// //         success: false,
// //         message: `Question not found`,
// //       });
// //     }

// //     res.json({
// //       success: true,
// //       message: ` All user Exams`,
// //       data: question,
// //     });
// //   } catch (error) {
// //     console.log("Error in exam controller", error);
// //   }
// // };

// export const submitAnswerhandler = async (req: any, res: any) => {
//   try {
//     let data = SubmitedQuestionAnsZodSchema.safeParse(req.query);
//     if (!data.success) {
//       return res.status(400).json({
//         success: false,
//         message: "invalid data",
//       });
//     }
//     let { examid, number, part, ans, ismultiple } = data.data;
//     let userid = req.user;
//     let Ans = ans.split(",");

//     // console.log("ans", ans);
//     // console.log("ans ty", typeof ans);

//     let status = await em.submitAnswer(
//       examid,
//       userid,
//       part,
//       Ans,
//       number,
//       ismultiple
//     );
//     // call back to user
//     if (status) {
//       console.log("status", status);
//       console.log("ans added ....");
//     }

//     if (!status) {
//       return res.status(400).json({
//         success: false,
//         message: `response not found`,
//       });
//     }

//     res.json({
//       success: true,
//       message: `ans collected`,
//       data: "collected",
//     });
//   } catch (error) {
//     console.log("Error in exam controller", error);
//   }
// };
// export const finalsubmitExam = async (req: any, res: any) => {
//   try {
//     let examid = req.query.examid;
//     // let number = req.query.number;
//     // let part = req.query.part;
//     // let ans = req.query.ans;
//     let userid = req.user;

//     let status = await em.submitExam(examid, userid);
//     // call back to user
//     if (status) {
//       console.log("status", status);
//       console.log("Exam Submited  ....");
//     }

//     if (!status) {
//       return res.status(400).json({
//         success: false,
//         message: `response not found`,
//       });
//     }

//     res.json({
//       success: true,
//       message: `Exam Submited Successfully ...`,
//       data: "collected",
//     });
//   } catch (error) {
//     console.log("Error in exam controller", error);
//   }
// };
