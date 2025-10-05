import prisma from "../db/index";
import { primeStatus, UserRole } from "@prisma/client";
import { hashPasswordFn } from "../lib/hash";
import path, { join } from "path";

import { addevent } from "./DB_setup/Tables/events";
import { SubcriptionsAndOffer } from "./DB_setup/Tables/subcriptionAndOffer";
import { telegramGroupInfo } from "./DB_setup/Tables/telegramGroupInfo";
import { entryCharges } from "./DB_setup/Tables/entryCharges";
import { tierBenifit } from "./DB_setup/Tables/tierBenifit";
import { createDpppattern } from "./DB_setup/Tables/createDpppattern";
import { sendBulkQuestionData } from "./DB_setup/Tables/questionsLoder";
import { sendBulkMockAndPyqData } from "./DB_setup/Tables/MockAndPyqLoader";
import { settings } from "./DB_setup/Tables/settings";

async function main() {
  console.log("Seeding database...");

  // Create Users
  const user1 = await prisma.user.create({
    data: {
      name: "subhajit garai",
      email: "subhajitgarai988@gmail.com",
      role: UserRole.Admin,
      prime: {
        create: {
          status: primeStatus.None,
        },
      },
      telegram: {
        create: {
          telegramid: "7057093987",
          last_update: new Date(),
        },
      },
      blance: {
        create: {
          amount: 1000,
          ticket: 100,
          last_update: new Date(),
        },
      },
      verification: {
        create: {},
      },
      password: await hashPasswordFn("subhajit@2002"),
    },
  });
  const razerpayDemoUser = await prisma.user.create({
    data: {
      name: "Razerpay ",
      email: process.env.RAZERPAY_TESTACCESS_USER_EMAIL!,
      role: UserRole.Admin,
      prime: {
        create: {
          status: primeStatus.None,
        },
      },
      telegram: {
        create: {
          telegramid: "92837878822",
          last_update: new Date(),
        },
      },
      blance: {
        create: {
          amount: 1,
          ticket: 1,
          last_update: new Date(),
        },
      },
      verification: {
        create: {},
      },
      password: await hashPasswordFn("subhajit@2002"),
    },
  });

  const bot = await prisma.user.create({
    data: {
      name: "bot1",
      email: "bot1@exambuddys.in",
      role: UserRole.Bot,
      prime: {
        create: {
          status: primeStatus.None,
        },
      },
      telegram: {
        create: {
          telegramid: "123456",
          last_update: new Date(),
        },
      },
      blance: {
        create: {
          amount: 1,
          ticket: 1,
          last_update: new Date(),
        },
      },
      verification: {
        create: {},
      },
      password: await hashPasswordFn("bot1@exambuddys.in@subhajit@jeca"),
    },
  });

  await prisma.botInfo.create({
    data: {
      botuser_id: bot.id,
      token: "8177562050:AAENozTalo0wmtt13v4x-Mb_PnFNT7G_zvY", // test.bot
      webhook: {
        baseurl: "https://bot.exambuddys.in",
        endpoint: { survertask: "/survertask" },
      },
    },
  });

  const bot2 = await prisma.user.create({
    data: {
      name: "bot1",
      email: "bot2@exambuddys.in",
      role: UserRole.Bot,
      prime: {
        create: {
          status: primeStatus.None,
        },
      },
      telegram: {
        create: {
          telegramid: "#8177562050",
          last_update: new Date(),
        },
      },
      blance: {
        create: {
          amount: 1,
          ticket: 1,
          last_update: new Date(),
        },
      },
      verification: {
        create: {},
      },

      password: await hashPasswordFn("bot2@exambuddys.in@subhajit@jeca"),
    },
  });

  // await prisma.botInfo.create({
  //   data: {
  //     botuser_id: bot2.id,
  //     token: "7903411142:AAGEsSlYFD89wc1JOf8KppQqdb1slIicTMY", // testbotprime.bot
  //     webhook: {
  //       baseurl: "https://bot.exambuddys.in",
  //       endpoint: {receiveQuizData:"/reciveQuizData"},
  //     },
  //   },
  // });

  // progress

  await prisma.progress.create({
    data: {
      userid: user1.id,
    },
  });

  let target_exam = await prisma.targetExam.create({
    data: {
      name: "JECA",
      shortCode: "JECA",
    },
  });

  // Syllabus
  const Syllabus = await prisma.syllabus.create({
    data: {
      category: "CS",
      target_exam_id: target_exam.id,
      topics: [
        "OS",
        "C",
        "DBMS",
        "NETWORK",
        "UNIX",
        "COMPUTER",
        "DSA",
        "SE",
        "CPP",
        "ML",
      ],
    },
  });

  // exampattern Pattern

  const exam_pattern = await prisma.exam_pattern.create({
    data: {
      title: "JECA@PATTERN",
      format: "Text",
      examname: "JECA",
      category: "CS",
      syllabus: "Syllabus",
      topics: Syllabus.topics,
      difficulty: "Easy",
      part: true,
      checkbox: true,
      part_Count: 2,
      total_questions: [80, 20],
      check: "Hybrid",
      marks_values: [1, 2],
      neg_values: [4, 0],
      is_multiple_ans: [0, 1],
      created_by: user1.id,
    },
  });

  //   await sendBulkQuestionData(
  //     path.resolve("prisma", "DB_setup", "data", "question.json"),
  //     user1.id
  //   );
  //   await sendBulkMockAndPyqData(
  //     path.resolve("prisma", "DB_setup", "data", "mockAndqyq.json"),
  //     user1.id
  //   );

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
