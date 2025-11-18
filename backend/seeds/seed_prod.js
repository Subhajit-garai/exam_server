"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../src/db/index"));
const subcriptionAndOffer_1 = require("./DB_setup/Tables/subcriptionAndOffer");
const telegramGroupInfo_1 = require("./DB_setup/Tables/telegramGroupInfo");
const entryCharges_1 = require("./DB_setup/Tables/entryCharges");
const tierBenifit_1 = require("./DB_setup/Tables/tierBenifit");
async function main() {
    console.log("Seeding database...");
    // // Create Users
    // const user1 = await prisma.user.create({
    //   data: {
    //     name: "subhajit garai",
    //     email: "subhajitgarai988@gmail.com",
    //     role: UserRole.Admin,
    //     prime: {
    //       create: {
    //         status: primeStatus.None,
    //       },
    //     },
    //     telegram: {
    //       create: {
    //         telegramid: "7057093987",
    //         last_update: new Date(),
    //       },
    //     },
    //     blance: {
    //       create: {
    //         amount: 1000,
    //         ticket: 100,
    //         last_update: new Date(),
    //       },
    //     },
    //     verification: {
    //       create: {},
    //     },
    //     password: await hashPasswordFn("subhajit@2002"),
    //   },
    // });
    // const razerpayDemoUser = await prisma.user.create({
    //   data: {
    //     name: "Razerpay ",
    //     email: process.env.RAZERPAY_TESTACCESS_USER_EMAIL!,
    //     role: UserRole.Admin,
    //     prime: {
    //       create: {
    //         status: primeStatus.None,
    //       },
    //     },
    //     telegram: {
    //       create: {
    //         telegramid: "92837878822",
    //         last_update: new Date(),
    //       },
    //     },
    //     blance: {
    //       create: {
    //         amount: 1,
    //         ticket: 1,
    //         last_update: new Date(),
    //       },
    //     },
    //     verification: {
    //       create: {},
    //     },
    //     password: await hashPasswordFn("subhajit@2002"),
    //   },
    // });
    // const bot = await prisma.user.create({
    //   data: {
    //     name: "bot1",
    //     email: "bot1@exambuddys.in",
    //     role: UserRole.Bot,
    //     prime: {
    //       create: {
    //         status: primeStatus.None,
    //       },
    //     },
    //     telegram: {
    //       create: {
    //         telegramid: "123456",
    //         last_update: new Date(),
    //       },
    //     },
    //     blance: {
    //       create: {
    //         amount: 1,
    //         ticket: 1,
    //         last_update: new Date(),
    //       },
    //     },
    //     verification: {
    //       create: {},
    //     },
    //     password: await hashPasswordFn("bot1@exambuddys.in@subhajit@jeca"),
    //   },
    // });
    // await prisma.botInfo.create({
    //   data: {
    //     botuser_id: bot.id,
    //     token: "8177562050:AAENozTalo0wmtt13v4x-Mb_PnFNT7G_zvY", // test.bot
    //     webhook: {
    //       baseurl: "https://bot.exambuddys.in",
    //       endpoint: { survertask: "/survertask" },
    //     },
    //   },
    // });
    // const bot2 = await prisma.user.create({
    //   data: {
    //     name: "bot2",
    //     email: "bot2@exambuddys.in",
    //     role: UserRole.Bot,
    //     prime: {
    //       create: {
    //         status: primeStatus.None,
    //       },
    //     },
    //     telegram: {
    //       create: {
    //         telegramid: "#8177562050",
    //         last_update: new Date(),
    //       },
    //     },
    //     blance: {
    //       create: {
    //         amount: 1,
    //         ticket: 1,
    //         last_update: new Date(),
    //       },
    //     },
    //     verification: {
    //       create: {},
    //     },
    //     password: await hashPasswordFn("bot2@exambuddys.in@subhajit@jeca"),
    //   },
    // });
    // await prisma.botInfo.create({
    //   data: {
    //     botuser_id: bot2.id,
    //     token: "7903411142:AAGEsSlYFD89wc1JOf8KppQqdb1slIicTMY", // test.bot
    //     webhook: {
    //       baseurl: "",
    //       endpoint: { survertask: "/survertask" },
    //     },
    //   },
    // });
    // // progress
    // await prisma.progress.create({
    //   data: {
    //     userid: user1.id,
    //   },
    // });
    // let { jecaSyllabus, gateSyllabus } = await subject(user1.id);
    //  await subject("cmhsr86zy0005buro0pgdp9lf");
    // const jeca_exam_pattern = await prisma.exam_pattern.create({
    //   data: {
    //     title: "JECA@PATTERN@2025",
    //     format: "Text",
    //     examname: "JECA",
    //     category: "CS",
    //     syllabus: "Syllabus",
    //     syllabusid: jecaSyllabus.id,
    //     topics: [],
    //     difficulty: "Easy",
    //     part: true,
    //     checkbox: true,
    //     part_Count: 2,
    //     total_questions: [80, 20],
    //     check: "Hybrid",
    //     marks_values: [1, 2],
    //     neg_values: [4, 0],
    //     is_multiple_ans: [0, 1],
    //     created_by: user1.id,
    //   },
    // });
    // const gate_exam_pattern = await prisma.exam_pattern.create({
    //   data: {
    //     title: "GATE@PATTERN@2025",
    //     format: "Text",
    //     examname: "GATE",
    //     category: "CS",
    //     syllabus: "Syllabus",
    //     syllabusid: gateSyllabus.id,
    //     topics: [],
    //     difficulty: "Medium",
    //     part: true,
    //     checkbox: true,
    //     part_Count: 2,
    //     total_questions: [80, 20],
    //     check: "Hybrid",
    //     marks_values: [1, 2],
    //     neg_values: [4, 0],
    //     is_multiple_ans: [0, 1],
    //     created_by: user1.id,
    //   },
    // });
    // settings();
    (0, tierBenifit_1.tierBenifit)();
    (0, entryCharges_1.entryCharges)("cmhlkoklm0005bubkzmbxyks7");
    (0, subcriptionAndOffer_1.SubcriptionsAndOffer)();
    (0, telegramGroupInfo_1.telegramGroupInfo)();
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
