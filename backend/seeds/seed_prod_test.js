"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("@repo/db/index"));
const client_1 = require("@repo/prisma/client");
;
const hash_1 = require("@repo/lib/security/hash");
async function main() {
    console.log("Seeding database...");
    // Create Users
    const user1 = await index_1.default.user.create({
        data: {
            name: "subhajit garai",
            email: "subhajitgarai988@gmail.com",
            role: client_1.UserRole.Admin,
            prime: {
                create: {
                    status: client_1.primeStatus.None,
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
            password: await (0, hash_1.hashPasswordFn)("subhajit@2002"),
        },
    });
    const razerpayDemoUser = await index_1.default.user.create({
        data: {
            name: "Razerpay ",
            email: process.env.RAZERPAY_TESTACCESS_USER_EMAIL,
            role: client_1.UserRole.Admin,
            prime: {
                create: {
                    status: client_1.primeStatus.None,
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
            password: await (0, hash_1.hashPasswordFn)("subhajit@2002"),
        },
    });
    const bot = await index_1.default.user.create({
        data: {
            name: "bot1",
            email: "bot1@exambuddys.in",
            role: client_1.UserRole.Bot,
            prime: {
                create: {
                    status: client_1.primeStatus.None,
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
            password: await (0, hash_1.hashPasswordFn)("bot1@exambuddys.in@subhajit@jeca"),
        },
    });
    await index_1.default.botInfo.create({
        data: {
            botuser_id: bot.id,
            token: "8177562050:AAENozTalo0wmtt13v4x-Mb_PnFNT7G_zvY", // test.bot
            webhook: {
                baseurl: "https://bot.exambuddys.in",
                endpoint: { survertask: "/survertask" },
            },
        },
    });
    const bot2 = await index_1.default.user.create({
        data: {
            name: "bot1",
            email: "bot2@exambuddys.in",
            role: client_1.UserRole.Bot,
            prime: {
                create: {
                    status: client_1.primeStatus.None,
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
            password: await (0, hash_1.hashPasswordFn)("bot2@exambuddys.in@subhajit@jeca"),
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
    await index_1.default.progress.create({
        data: {
            userid: user1.id,
        },
    });
    let target_exam = await index_1.default.targetExam.create({
        data: {
            name: "JECA",
            shortCode: "JECA",
        },
    });
    // Syllabus
    // exampattern Pattern
    const exam_pattern = await index_1.default.exam_pattern.create({
        data: {
            title: "JECA@PATTERN",
            format: "Text",
            examname: "JECA",
            category: "CS",
            syllabus: "Syllabus",
            // topics: Syllabus.topics,
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
    await index_1.default.$disconnect();
});
