import prisma from "../db/index";
import { primeStatus } from "@prisma/client";
import {
  Createhash,
  generateResetToken,
  hashPasswordFn,
  veryfyhashPasswordFn,
} from "../lib/hash";

async function main() {
  console.log("Seeding database...");

  // Create Users
  const user1 = await prisma.user.create({
    data: {
      name: "subhajit garai",
      email: "subhajitgarai988@gmail.com",
      role: "Admin",
      prime: {
        create: {
          status: primeStatus.none,
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

  const bot = await prisma.user.create({
    data: {
      name: "bot1",
      email: "bot1@exambuddys.in",
      prime: {
        create: {
          status: primeStatus.none,
        },
      },
      telegram: {
        create: {
          telegramid: "1234782",
          last_update: new Date(),
        },
      },
      blance: {
        create: {
          amount: 10,
          ticket: 1,
          last_update: new Date(),
        },
      },
      verification: {
        create: {},
      },
      password: await hashPasswordFn("bot1@exambuddys.in"),
    },
  });
  

  const user2 = await prisma.user.create({
    data: {
      name: "debasmita",
      email: "debasmitac73@gmail.com",
      // role: "User",
      prime: {
        create: {
          status: primeStatus.none,
        },
      },
      telegram: {
        create: {
          telegramid: "123893784",
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
      password: await hashPasswordFn("tester@debasmitac73"),
    },
  });
  const user3 = await prisma.user.create({
    data: {
      name: " ani adhikary",
      email: "ani.adhikary.official@gmail.com",
      // role: "User",
      prime: {
        create: {
          status: primeStatus.none,
        },
      },
      telegram: {
        create: {
          telegramid: "12786782",
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
      password: await hashPasswordFn("tester@adhikary"),
    },
  });
  const user4 = await prisma.user.create({
    data: {
      name: " debsankar dhara",
      email: "20debsankardhara03@gmail.com",
      // role: "User",
      prime: {
        create: {
          status: primeStatus.none,
        },
      },
      telegram: {
        create: {
          telegramid: "123354892",
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
      password: await hashPasswordFn("tester@debsankar"),
    },
  });

  // progress

  await prisma.progress.create({
    data:{
      userid:user1.id
    }
  })
  await prisma.progress.create({
    data:{
      userid:user2.id
    }
  })
  await prisma.progress.create({
    data:{
      userid:user3.id
    }
  })
  // Create Prime Memberships
  await prisma.prime.createMany({
    data: [
      { userid: user1.id, status: "gold", expiry: new Date("2025-12-31") },
    ],
  });

  // EntryChargeList
  const EntryChargeList = await prisma.entryChargeList.create({
    data: {
      exam: 3,
      contest: 4,
      quiz: 1,
      created_by: user1.id,
    },
  });
  // Syllabus
  const Syllabus = await prisma.syllabus.create({
    data: {
      category: "CS",
      examname: "JECA",
      topics: ["OS", "C","DBMS","NETWORK" ,"UNIX","COMPUTER","DSA"],
    },
  });
  // CreatePattern

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
      total_questions: [80,20],
      check: "Hybrid",
      marks_values: [1,2],
      neg_values: [4,0],
      created_by: user1.id,
    },
  });

  const payment_access = await prisma.appConfig.create({
    data: {
      feature:"token-purchases",
      settings:{status:"close"}
    }
  });
  const user_login_access = await prisma.appConfig.create({
    data: {
      feature:"user-login",
      settings:{status:"open"}
    }
  });
  const user_signup_access = await prisma.appConfig.create({
    data: {
      feature:"user-signup",
      settings:{status:"close"}
    }
  });



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
