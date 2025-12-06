/* ----------------------------------
   prisma/seed.ts — PART 1
   Setup + USER SEEDING SECTION
-------------------------------------*/

import {
  eventRuns,
  eventType,
  ExamType,
  primeStatus,
  purchaseType,
  UserRole,
  Visibility,
} from "./generated/prisma/enums";
import fs from "fs";
import path from "path";

import { PrismaClient } from "./generated/prisma/client";
import { hashPasswordFn } from "../src/lib/security/hash";
import {
  event_exam_data_type,
  event_Quiz_data_type,
} from "../src/lib/types/EventTypes";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });


/* ---------- SUBSCRIPTIONS & OFFERS CONFIG ---------- */
const subcriptions = [
  {
    markedPrice: 300,
    title: "Bronze",
    price: 150,
    time: "2 Month",
    offerActive: ["Access to Our Exclusive Telegram Premium Group"],
    offerInActive: [
      "Free Daily Practice Tests",
      "Access Free DPPs Every Day",
      "Free Access to PYQ Tests",
      "Free Access to Mock Tests",
    ],
    btncolor: "",
  },
  {
    markedPrice: 400,
    title: "Silver",
    price: 200,
    time: "2 Month",
    offerActive: [
      "Access to Our Exclusive Telegram Premium Group",
      "Free Daily Practice Tests",
      "Access Free DPPs Every Day",
    ],
    offerInActive: ["Free Access to PYQ Tests", "Free Access to Mock Tests"],
    btncolor: "success",
  },
  {
    markedPrice: 500,
    title: "Gold",
    price: 250,
    time: "2 Month",
    offerActive: [
      "Access to Our Exclusive Telegram Premium Group",
      "Free Daily Practice Tests",
      "Access Free DPPs Every Day",
      "Free Access to PYQ Tests",
      "Free Access to Mock Tests",
    ],
    offerInActive: [],
    btncolor: "",
  },
];

const offers = [
  {
    markedPrice: 300,
    title: "Basic Plan",
    price: 150,
    token: 150,
    offerActive: ["This card does not include any bonus or additional tokens"],
    offerInActive: [],
    btncolor: "",
  },
  {
    markedPrice: 300,
    title: "Standerd Plan",
    price: 200,
    token: 205,
    offerActive: ["Get 5 extra tokens with this purchase."],
    offerInActive: [],
    btncolor: "success",
  },
  {
    markedPrice: 300,
    title: "Premium Plan",
    price: 250,
    token: 260,
    offerActive: ["Get 10 extra tokens with this purchase."],
    offerInActive: [],
    btncolor: "",
  },
];

/* ---------- QUESTION IMPORT HELPERS ---------- */

export const getDiscountPercent = (markedPrice: number, price: number) => {
  return ((markedPrice - price) / markedPrice) * 100;
};
type BenefitInput = {
  feature: ExamType;
  access: boolean;
  limit: number | null;
  used?: number;
};
export async function createOrUpdateTier(
  tierName: primeStatus,
  benefits: BenefitInput[]
) {
  // Check if tier exists
  const existing = await prisma.tier.findUnique({
    where: { name: tierName },
  });

  if (!existing) {
    // Create Tier
    const newTier = await prisma.tier.create({
      data: {
        name: tierName,
        benefits: {
          create: benefits.map((b) => ({
            feature: b.feature,
            access: b.access,
            limit: b.limit,
            used: b.used ?? 0,
          })),
        },
      },
      include: { benefits: true },
    });
    console.log(`Created tier ${tierName}`, newTier);
    return newTier;
  } else {
    // Update/Add/Upsert each benefit
    const updates = await Promise.all(
      benefits.map((b) =>
        prisma.tierBenefit.upsert({
          where: {
            tierId_feature: {
              tierId: existing.id,
              feature: b.feature,
            },
          },
          update: {
            access: b.access,
            limit: b.limit,
            used: b.used ?? 0,
          },
          create: {
            tierId: existing.id,
            feature: b.feature,
            access: b.access,
            limit: b.limit,
            used: b.used ?? 0,
          },
        })
      )
    );
    return updates;
  }
}

export const sendBulkQuestionData = async (
  inputepath: string,
  userid: string,
  subjectid: string,
  topicid: string
) => {
  const fileRaw = fs.readFileSync(inputepath, { encoding: "utf-8" });
  let data: any[] = JSON.parse(fileRaw);

  data = changeUserid(userid, data, subjectid, topicid);

  const length = data.length;
  const chunkSize = 300;

  if (length > chunkSize) {
    console.log("too large data ... chunking into", chunkSize);

    for (let index = 0; index < length; index += chunkSize) {
      const chunk = data.slice(index, index + chunkSize);
      console.log(
        `Inserting chunk ${index / chunkSize + 1} — records ${index}..${index + chunk.length - 1
        }`
      );
      await bulkQuestionCreate(chunk);
      // small sleep to avoid DB overload
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    console.log("question import process finished");
  } else {
    // IMPORTANT: await here as well
    await bulkQuestionCreate(data);
  }
};

export const changeUserid = (
  userid: string,
  data: any[],
  subjectid: string,
  topicid: string
) => {
  let count = 0;
  const processeddata = data.map((d: any) => {
    count++;
    d.created_by = userid;
    // delete number if exists
    if ("number" in d) delete d.number;

    d.old_topic = d.topic ?? null;
    d.old_sub_topic = d.sub_topic ?? null;
    d.topic_id = topicid;
    d.subject_id = subjectid;
    d.format = d.formate ?? d.format ?? null;
    if ("formate" in d) delete d.formate;
    if ("topic" in d) delete d.topic;
    if ("sub_topic" in d) delete d.sub_topic;
    return { ...d };
  });

  console.log("totalquestions ___>", count);
  return processeddata;
};

export const bulkQuestionCreate = async (bulkData: any[]) => {
  if (!bulkData || bulkData.length === 0) {
    console.log("no data to insert for this batch");
    return;
  }

  const result = await prisma.questions.createMany({
    data: bulkData,
    skipDuplicates: true,
  });

  console.log("createMany result:", result);

  // prisma returns object like { count: N } — ensure it's present
  if (!result || typeof result.count !== "number") {
    throw new Error("question createMany returned unexpected result");
  }
};
/* ---------- SUBSCRIPTIONS & OFFERS CREATOR (fixed) ---------- */
const SubcriptionsAndOffer = async () => {
  // create subscription rows sequentially and await
  for (const sub of subcriptions) {
    await prisma.subcriptionOffers.create({
      data: {
        type: purchaseType.SUBSCRIPTION,
        title: sub.title,
        price: sub.price,
        offerActive: sub.offerActive,
        offerInActive: sub.offerInActive,
        btncolor: sub.btncolor,
        time: sub.time,
        markedPrice: sub.markedPrice,
        discount: getDiscountPercent(sub.markedPrice, sub.price),
      },
    });
  }

  // create token offers sequentially and await
  for (const offer of offers) {
    await prisma.subcriptionOffers.create({
      data: {
        type: purchaseType.TOKEN,
        title: offer.title,
        price: offer.price,
        offerActive: offer.offerActive,
        offerInActive: offer.offerInActive,
        btncolor: offer.btncolor,
        token: offer.token,
        markedPrice: offer.markedPrice,
        discount: getDiscountPercent(offer.markedPrice, offer.price),
      },
    });
  }
};

/* ---------- ENTRY CHARGES ---------- */
const entryCharges = async (userid: string) => {
  await prisma.entryChargeList.create({
    data: { type: ExamType.Test, Charge: 10, created_by: userid },
  });

  await prisma.entryChargeList.create({
    data: { type: ExamType.Subject, Charge: 10, created_by: userid },
  });

  await prisma.entryChargeList.create({
    data: { type: ExamType.Contest, Charge: 10, created_by: userid },
  });

  await prisma.entryChargeList.create({
    data: { type: ExamType.Dpp, Charge: 5, created_by: userid },
  });

  await prisma.entryChargeList.create({
    data: { type: ExamType.Mock, Charge: 20, created_by: userid },
  });

  await prisma.entryChargeList.create({
    data: { type: ExamType.PYQ, Charge: 15, created_by: userid },
  });
};

/* ---------- EVENTS SECTION (addevent) ---------- */
const addevent = async (botid: string, exam_pattern_id: string) => {
  // Create a set of daily events for the bot

  let Create_exam_payload: event_exam_data_type = {
    starttime: ["8:00 am"],
    count: "1",
    title: "autoincrement",
    examname: "JECA",
    category: "CS",
    Visibility: Visibility.Public,
    time_limit: "t",
    exam_pattern: exam_pattern_id,
    duration: "02:00",
    jointime: "10:00",
    difficulty: "Easy",
    examtype: "Test",
  };
  await prisma.events.create({
    data: {
      type: eventType.CREATE_EXAM,
      description: "Create new exam",
      payload: Create_exam_payload,
      conditions: { when: "None" },
      created_by: UserRole.Bot,
      runs: eventRuns.DAILY,
      run_at: "04:00 am",
    },
  });

  await prisma.events.create({
    data: {
      type: "CLEAR_BOT_CACHE",
      description: "Clear bot cache event",
      payload: {},
      conditions: { when: "any" },
      runs: eventRuns.DAILY,
      run_at: "2:00 am",
    },
  });

  let run_quiz_event_payload: event_Quiz_data_type = {
    type: "quiz",
    bot_user_id: botid,
    platform: "TELEGRAM",
    chat_type: "group",
    user_id: 7057093987,
    chat_id: -1002365541288,
    thread_id: 3,
  };
  // rapidquiz group event
  await prisma.events.create({
    data: {
      type: "RUN_NEW_QUIZ",
      description: "Quiz Event for normal group",
      payload: run_quiz_event_payload,
      conditions: { when: "any" },
      runs: eventRuns.DAILY,
      run_at: "10:00 pm",
    },
  });

  // premium events (multiple times)
  const premiumChats = [
    { chat_id: -1002506753144, run_at: "8:00 am" },
    { chat_id: -1002506753144, run_at: "9:00 am" },
    { chat_id: -1002506753144, run_at: "8:00 pm" },
    { chat_id: -1002506753144, run_at: "9:00 pm" },
    { chat_id: -1002506753144, run_at: "10:30 pm" },
  ];

  for (const p of premiumChats) {
    let payload: event_Quiz_data_type = {
      type: "quiz",
      platform: "TELEGRAM",
      bot_user_id: botid,
      chat_type: "supergroup",
      user_id: 7057093987,
      chat_id: p.chat_id,
      thread_id: 3,
    };
    await prisma.events.create({
      data: {
        type: "RUN_NEW_QUIZ",
        description: "Premium quiz event",
        payload: payload,
        conditions: { when: "any" },
        runs: eventRuns.DAILY,
        run_at: p.run_at,
      },
    });
  }
};

/* ---------- SETTINGS CREATOR ---------- */
const settings = async () => {
  await prisma.appConfig.create({
    data: { feature: "bot-access", settings: { status: "open" } },
  });

  await prisma.appConfig.create({
    data: { feature: "razerpay-testaccess", settings: { status: "close" } },
  });

  await prisma.appConfig.create({
    data: { feature: "token-purchases", settings: { status: "close" } },
  });

  await prisma.appConfig.create({
    data: { feature: "user-login", settings: { status: "open" } },
  });

  await prisma.appConfig.create({
    data: { feature: "user-signup", settings: { status: "close" } },
  });
};

/* ----------------------------------
   MAIN - ENTRY POINT
-------------------------------------*/
async function main() {
  console.log("Seeding database...");

  // ---------- USER SEEDING SECTION ----------
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
      social: {
        create: {
          telegram: "7057093987",
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
      password: await hashPasswordFn("admin@exambuddys"),
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
      social: {
        create: {
          telegram: "92837878822",
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
      password: await hashPasswordFn("razerpay@exambuddys"),
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
      social: {
        create: {
          telegram: "123456",
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
      password: await hashPasswordFn("bot@exambuddys"),
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
      name: "bot2",
      email: "bot2@exambuddys.in",
      role: UserRole.Bot,
      prime: {
        create: {
          status: primeStatus.None,
        },
      },
      social: {
        create: {
          telegram: "#8177562050",
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
      password: await hashPasswordFn("bot@exambuddys"),
    },
  });

  await prisma.botInfo.create({
    data: {
      botuser_id: bot2.id,
      token: "7903411142:AAGEsSlYFD89wc1JOf8KppQqdb1slIicTMY", // test.bot
      webhook: {
        baseurl: "",
        endpoint: { survertask: "/survertask" },
      },
    },
  });



  // ---------- TARGET EXAMS ----------
  const target_exam = await prisma.targetExam.create({
    data: {
      name: "JECA",
      shortCode: "JECA",
      examScope: "STATE",
    },
  });

  const target_exam2 = await prisma.targetExam.create({
    data: {
      name: "GATE",
      shortCode: "GATE",
      examScope: "NATIONAL",
    },
  });

  // ---------- EXAM YEARS ----------
  const jeca_examYear = await prisma.examYear.create({
    data: {
      slug: "jeca_2025",
      year: 2025,
      targetExamId: target_exam.id,
    },
  });

  const gate_examYear = await prisma.examYear.create({
    data: {
      slug: "gate_2025",
      year: 2025,
      targetExamId: target_exam2.id,
    },
  });

  // ---------- SYLLABUS ----------
  const jecaSyllabus = await prisma.syllabus.create({
    data: {
      title: "jeca_syllabus_2025",
      exam_year_id: jeca_examYear.id,
    },
  });

  const gateSyllabus = await prisma.syllabus.create({
    data: {
      title: "gate_syllabus_2025",
      exam_year_id: gate_examYear.id,
    },
  });

  // ---------- SUBJECTS & TOPICS ----------
  const unknownSubject = await prisma.subject.create({
    data: {
      name: "unknown",
      shortName: "unknown",
      slug: "unknown",
      order: 100,
      category: "CS",
    },
  });

  const unknownTopic = await prisma.topic.create({
    data: {
      name: "unknown",
      shortName: "unknown",
      slug: "unknown",
      order: 100,
      subjectId: unknownSubject.id,
    },
  });

  // ---------- QUESTION ADDING SECTION ----------
  // note: sendBulkQuestionData is awaited (implemented below)
  await sendBulkQuestionData(
    path.resolve("seeds", "data", "question.json"),
    user1.id,
    unknownSubject.id,
    unknownTopic.id
  );
}

/* ----------------------------------
  prisma/seed.ts — PART 2
  Exam patterns + Tiers + Offers + Settings
-------------------------------------*/

(async () => {
  try {
    // Call main to run the top portion first
    await main();

    /* ---------- CATEGORY ---------- */
    const csCategory = await prisma.category.upsert({
      where: { name: "CS" },
      update: {},
      create: { name: "CS", slug: "cs" },
    });

    /* ---------- EXAM PATTERN ---------- */
    const jeca_exam_pattern = await prisma.exam_pattern.create({
      data: {
        title: "JECA@PATTERN@2025",
        format: "Text",
        examname: "JECA",
        Category: {
          connect: { id: csCategory.id },
        },
        syllabus: "Syllabus",
        syllabusid: (await prisma.syllabus.findFirst({
          where: { title: "jeca_syllabus_2025" },
        }))!.id,
        topics: [],
        difficulty: "Easy",
        part: true,
        checkbox: true,
        part_Count: 2,
        total_questions: [80, 20],
        check: "Hybrid",
        marks_values: [1, 2],
        neg_values: [4, 0],
        is_multiple_ans: [0, 1],
        User: {
          connect: {
            id: (await prisma.user.findFirst({
              where: { email: "subhajitgarai988@gmail.com" },
            }))!.id,
          }
        }
      },
    });

    // ---------- TIERS ----------
    // create tiers sequentially (keeps order deterministic)
    const None = await prisma.tier.create({ data: { name: "None" } });
    const Bronze = await prisma.tier.create({ data: { name: "Bronze" } });
    const Silver = await prisma.tier.create({ data: { name: "Silver" } });
    const GOLD = await prisma.tier.create({ data: { name: "Gold" } });

    // createOrUpdateTier is external — we await it
    await createOrUpdateTier("None", [
      { feature: "Quiz", access: false, limit: null },
      { feature: "Test", access: false, limit: null },
      { feature: "Dpp", access: false, limit: 10 },
      { feature: "PYQ", access: false, limit: 10 },
      { feature: "Mock", access: false, limit: 5 },
    ]);
    await createOrUpdateTier("Bronze", [
      { feature: "Quiz", access: true, limit: null },
      { feature: "Test", access: false, limit: null },
      { feature: "Dpp", access: false, limit: 10 },
      { feature: "PYQ", access: false, limit: 10 },
      { feature: "Mock", access: false, limit: 5 },
    ]);
    await createOrUpdateTier("Silver", [
      { feature: "Quiz", access: true, limit: null },
      { feature: "Test", access: true, limit: null },
      { feature: "Dpp", access: true, limit: 10 },
      { feature: "PYQ", access: false, limit: 10 },
      { feature: "Mock", access: false, limit: 5 },
    ]);
    await createOrUpdateTier("Gold", [
      { feature: "Quiz", access: true, limit: null },
      { feature: "Test", access: true, limit: null },
      { feature: "Dpp", access: true, limit: 10 },
      { feature: "PYQ", access: true, limit: 10 },
      { feature: "Mock", access: true, limit: 5 },
    ]);

    // ---------- ENTRY CHARGES ----------
    // find an admin user to use as created_by (fallback to first user)
    const adminUser = (await prisma.user.findFirst({
      where: { role: UserRole.Admin },
    }))!;
    await entryCharges(adminUser.id);

    // ---------- SUBSCRIPTIONS & OFFERS (fixed to await each create) ----------
    await SubcriptionsAndOffer();

    // ---------- SETTINGS ----------
    await settings();

    // ---------- EVENTS (optional) ----------
    // If you'd like scheduled events added, we can add them — using first bot and exam pattern:
    const firstBot = await prisma.user.findFirst({
      where: { role: UserRole.Bot },
    });
    if (firstBot && jeca_exam_pattern) {
      await addevent(firstBot.id, jeca_exam_pattern.id);
    }

    console.log("Seeding completed.");
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
