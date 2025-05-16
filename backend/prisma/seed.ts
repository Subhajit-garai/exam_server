// import prisma from "../db/index";
// import { primeStatus } from "@prisma/client";
// import {
//   Createhash,
//   generateResetToken,
//   hashPasswordFn,
//   veryfyhashPasswordFn,
// } from "../lib/hash";

// async function main() {
//   console.log("Seeding database...");

//   // Create Users
//   const bot = await prisma.user.create({
//     data: {
//       name: "bot1",
//       email: "bot1@exambuddys.in",
//       prime: {
//         create: {
//           status: primeStatus.none,
//         },
//       },
//       telegram: {
//         create: {
//           telegramid: "123456",
//           last_update: new Date(),
//         },
//       },
//       blance: {
//         create: {
//           amount: 10,
//           ticket: 1,
//           last_update: new Date(),
//         },
//       },
//       verification: {
//         create: {},
//       },
//       password: await hashPasswordFn("bot1@exambuddys.in"),
//     },
//   });
//   const user = await prisma.user.create({
//     data: {
//       name: "subhjit",
//       email: "subhajit@gmail.com",
//       prime: {
//         create: {
//           status: primeStatus.none,
//         },
//       },
//       telegram: {
//         create: {
//           telegramid: "123456",
//           last_update: new Date(),
//         },
//       },
//       blance: {
//         create: {
//           amount: 10,
//           ticket: 1,
//           last_update: new Date(),
//         },
//       },
//       verification: {
//         create: {},
//       },
//       password: await hashPasswordFn("subhajit"),
//     },
//   });
//   const user1 = await prisma.user.create({
//     data: {
//       name: "subho",
//       email: "s@gmail.com",
//       role: "Admin",
//       prime: {
//         create: {
//           status: primeStatus.none,
//         },
//       },
//       telegram: {
//         create: {
//           telegramid: "123456",
//           last_update: new Date(),
//         },
//       },
//       blance: {
//         create: {
//           amount: 10,
//           ticket: 1,
//           last_update: new Date(),
//         },
//       },
//       verification: {
//         create: {},
//       },
//       password: await hashPasswordFn("subhajit"),
//     },
//   });
//   const user2 = await prisma.user.create({
//     data: {
//       name: "subham",
//       email: "subham@gmail.com",
//       prime: {
//         create: {
//           status: primeStatus.none,
//         },
//       },
//       telegram: {
//         create: {
//           telegramid: "12598256",
//           last_update: new Date(),
//         },
//       },
//       blance: {
//         create: {
//           amount: 10,
//           ticket: 1,
//           last_update: new Date(),
//         },
//       },
//       verification: {
//         create: {},
//       },
//       password: await hashPasswordFn("subhajit"),
//     },
//   });

//   // progress

//   await prisma.progress.create({
//     data:{
//       userid:user.id
//     }
//   })
//   await prisma.progress.create({
//     data:{
//       userid:user1.id
//     }
//   })
//   await prisma.progress.create({
//     data:{
//       userid:user2.id
//     }
//   })
//   // Create Prime Memberships
//   await prisma.prime.createMany({
//     data: [
//       { userid: user1.id, status: "gold", expiry: new Date("2025-12-31") },
//       { userid: user2.id, status: "silver", expiry: new Date("2025-06-30") },
//     ],
//   });

//   // EntryChargeList
//   const EntryChargeList = await prisma.entryChargeList.create({
//     data: {
//       exam: 4,
//       contest: 5,
//       quiz: 2,
//       created_by: user1.id,
//     },
//   });
//   // Syllabus
//   const Syllabus = await prisma.syllabus.create({
//     data: {
//       category: "CS",
//       examname: "JECA",
//       topics: ["OS", "C"],
//     },
//   });
//   // CreatePattern

//   const exam_pattern = await prisma.exam_pattern.create({
//     data: {
//       title: "P@1",
//       format: "Text",
//       examname: "JECA",
//       category: "CS",
//       syllabus: "Syllabus",
//       topics: Syllabus.topics,
//       difficulty: "Easy",
//       part: false,
//       checkbox: true,
//       part_Count: 1,
//       total_questions: [20],
//       check: "Normal",
//       marks_values: [1],
//       neg_values: [4],
//       created_by: user1.id,
//     },
//   });

//   // Create Questions
//   const question1 = await prisma.questions.create({
//     data: {
//       title: "What is 2 + 2?",
//       options: ["3", "4", "5", "6"],
//       ans: ["2"],
//       formate: "Text",
//       category: "CS",
//       topic: "OS",
//       created_by: user1.id,
//       difficulty: "Easy",
//     },
//   });
//   const question2 =  await prisma.questions.create({
//     data: {
//       title: "What is 4 + 2?",
//       options: ["3", "4", "5", "6"],
//       ans: ["4"],
//       formate: "Text",
//       category: "CS",
//       topic: "C",
//       created_by: user1.id,
//       difficulty: "Easy",
//     },
//   });


//     // ans 
//     const ans1 = await prisma.ansSheet.create({
//       data: {
//         ans: [
//           [
//             {
//               id: question1.id,
//               ans: ["2"],
//               part: "part1",
//               topic: "OS",
//             },
//             {
//               id: question2.id,
//               ans: ["4"],
//               part: "part1",
//               topic: "C",
//             },
//           ],
//         ],
//         status: "Done",
//       },
//     });
//     const ans2 = await prisma.ansSheet.create({
//       data: {
//         ans: [
//           [
//             {
//               id: "cm7rip6y7000mbu6g51klkkg0",
//               ans: ["2"],
//               part: "part1",
//               topic: "OS",
//             },
//             {
//               id: "cm7rip6yb000obu6g5sou2xyt",
//               ans: ["4"],
//               part: "part1",
//               topic: "C",
//             },
//           ],
//         ],
//         status: "Done",
//       },
//     });

//   // Create Exams
//   const exam1 = await prisma.exam.create({
//     data: {
//       name: "Exam@1",
//       examname: "jeca",
//       category: "CS",
//       questions: {
//         part1: [ question1.id, question2.id],
//       },
//       created_by: user1.id,
//       exam_pattern_id: exam_pattern.id,
//       examtype: "Exam",
//       ansid: ans1.id,
//       status: "Public",
//       creationstatus: "Done",
//       starttime: "no limit",
//       date: "01-01-2015",
//       jointime: "no limit",
//       duration: "02:00 h",
//       stage: "Registration",
//       ContestRegister:{
//         create:{
//         }
//       }
//     },
//   });
//   const exam2 = await prisma.exam.create({
//     data: {
//       name: "Exam@2",
//       examname: "jeca",
//       category: "CS",
//       questions: {
//         part1: [ question1.id, question2.id],
//       },
//       created_by: user1.id,
//       exam_pattern_id: exam_pattern.id,
//       examtype: "Exam",
//       ansid: ans2.id,
//       status: "Public",
//       creationstatus: "Done",
//       starttime: "no limit",
//       date: "01-01-2015",
//       jointime: "no limit",
//       duration: "02:00 h",
//       stage: "Registration",
//       ContestRegister:{
//         create:{
//         }
//       }
//     },
//   });

//   await prisma.ansSheet.update({
//     where:{
//       id:ans1.id
//     },
//     data:{
//       examId:exam1.id
//     }
//   })
//   await prisma.ansSheet.update({
//     where:{
//       id:ans2.id
//     },
//     data:{
//       examId:exam2.id
//     }
//   })

//   const payment_access = await prisma.appConfig.create({
//     data: {
//       feature:"token-purchases",
//       settings:{status:"close"}
//     }
//   });
//   const user_login_access = await prisma.appConfig.create({
//     data: {
//       feature:"user-login",
//       settings:{status:"open"}
//     }
//   });
//   const user_signup_access = await prisma.appConfig.create({
//     data: {
//       feature:"user-signup",
//       settings:{status:"open"}
//     }
//   });

//   let botQuizConfig = await prisma.botQuizConfig.create({
//     data:{
//       exam:"JECA",
//       quiztopic:["UNIX"],
//       question_count:"25",
//       rapidtopic:["UNIX" , "OS"]
//     }
//   })



//   console.log("Seeding completed.");
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
