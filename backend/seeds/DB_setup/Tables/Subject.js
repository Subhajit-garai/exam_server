"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subject = void 0;
const questionsLoder_1 = require("./questionsLoder");
const path_1 = __importDefault(require("path"));
const subject = async (userid) => {
    // targeted exam
    // let target_exam = await prisma.targetExam.create({
    //   data: {
    //     name: "JECA",
    //     shortCode: "JECA",
    //     examScope: "STATE",
    //   },
    // });
    // let target_exam2 = await prisma.targetExam.create({
    //   data: {
    //     name: "GATE",
    //     shortCode: "GATE",
    //     examScope: "NATIONAL",
    //   },
    // });
    // // targeted exam year
    // let jeca_examYear = await prisma.examYear.create({
    //   data: {
    //     slug: "jeca_2025",
    //     year: 2025,
    //     targetExamId: target_exam.id,
    //   },
    // });
    // let gate_examYear = await prisma.examYear.create({
    //   data: {
    //     slug: "gate_2025",
    //     year: 2025,
    //     targetExamId: target_exam2.id,
    //   },
    // });
    // // Syllabus
    // let jecaSyllabus = await prisma.syllabus.create({
    //   data: {
    //     title: "jeca_syllabus_2025",
    //     exam_year_id: jeca_examYear.id,
    //   },
    // });
    // let gateSyllabus = await prisma.syllabus.create({
    //   data: {
    //     title: "gate_syllabus_2025",
    //     exam_year_id: gate_examYear.id,
    //   },
    // });
    // // subject
    // let unknownSubject = await prisma.subject.create({
    //   data: {
    //     name: "unknown",
    //     shortName: "unknown",
    //     slug: "unknown",
    //     order: 100,
    //     category: "CS",
    //   },
    // });
    // let unknownTopic = await prisma.topic.create({
    //   data: {
    //     name: "unknown",
    //     shortName: "unknown",
    //     slug: "unknown",
    //     order: 100,
    //     subjectId: unknownSubject.id,
    //   },
    // });
    await (0, questionsLoder_1.sendBulkQuestionData)(path_1.default.resolve("prisma", "DB_setup", "data", "question.json"), userid, "cmhsr876q0012burojx8usd0w", "cmhsr876x0015burop97wfdbq");
    // return { jecaSyllabus, gateSyllabus };
};
exports.subject = subject;
