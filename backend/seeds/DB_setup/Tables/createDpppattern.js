"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDpppattern = void 0;
const client_1 = require("@repo/prisma/client");
;
const index_1 = __importDefault(require("@repo/db/index"));
const createDpppattern = async (Syllabus, userid) => {
    let exam_patten_on_subject = [];
    if (!Syllabus)
        return;
    // Syllabus.topics.map(async (topic) => {
    //   const exam_pattern_subject_wise = await prisma.exam_pattern.create({
    //     data: {
    //       title: `JECA@PATTERN@${topic}`,
    //       format: "Text",
    //       examname: "JECA",
    //       category: "CS",
    //       syllabus: "Generic",
    //       topics: [`${topic}`],
    //       difficulty: "Easy",
    //       part: false,
    //       checkbox: false,
    //       part_Count: 1,
    //       total_questions: [15],
    //       check: "Normal",
    //       marks_values: [1],
    //       neg_values: [4],
    //       created_by: userid,
    //     },
    //   });
    //   if (exam_pattern_subject_wise) {
    //     console.log("exam pattern is created for ", topic);
    //     exam_patten_on_subject.push(exam_pattern_subject_wise.id);
    //   }
    // });
    // await waitForSomeThink(() => {
    //   if (Syllabus.topics.length === exam_patten_on_subject.length) return true;
    //   return false;
    // }, 3);
    console.log("exam_patten_on_subject----->", exam_patten_on_subject);
    let eventStatus = await index_1.default.events.create({
        data: {
            type: client_1.eventType.CREATE_DPP,
            description: "Create new dpp event",
            data: {
                time: ["4:00 am", "4:00 am"],
                count: 2,
                name: "autoincrement",
                examname: "JECA",
                category: "CS",
                Visibility: client_1.Visibility.Public,
                time_limit: "t+2",
                exam_pattern: exam_patten_on_subject,
                duration: "00:30",
                jointime: "20:00",
                difficulty: "Easy",
                examtype: "Dpp",
            },
            conditions: { when: "None" },
            created_by: client_1.UserRole.Bot,
            runs: client_1.eventRuns.DAILY,
            run_at: "04:00 am",
        },
    });
    console.log("event -----> ", eventStatus);
};
exports.createDpppattern = createDpppattern;
