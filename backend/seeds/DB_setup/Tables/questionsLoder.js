"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkQuestionCreate = exports.changeUserid = exports.sendBulkQuestionData = void 0;
const index_1 = __importDefault(require("@repo/db/index"));
const fs_1 = __importDefault(require("fs"));
const sendBulkQuestionData = async (inputepath, userid, subjectid, topicid) => {
    let data = JSON.parse(fs_1.default.readFileSync(inputepath, { encoding: "utf-8" }));
    data = (0, exports.changeUserid)(userid, data, subjectid, topicid);
    let length = data.length;
    const chunkSize = 300;
    if (length > chunkSize) {
        console.log("too  large data ...");
        for (let index = 0; index < length; index += chunkSize) {
            const chunk = data.slice(index, index + chunkSize);
            console.log("---------------------------------------");
            await (0, exports.bulkQuestionCreate)(chunk);
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
        console.log("process finished ");
    }
    else {
        (0, exports.bulkQuestionCreate)(data);
    }
};
exports.sendBulkQuestionData = sendBulkQuestionData;
const changeUserid = (userid, data, subjectid, topicid) => {
    let count = 0;
    let processeddata = data.map((d) => {
        d.created_by = userid;
        count++;
        delete d.number;
        d.old_topic = d.topic;
        d.old_sub_topic = d.sub_topic;
        d.topic_id = topicid;
        d.subject_id = subjectid;
        d.format = d.formate;
        delete d.formate;
        delete d.topic;
        delete d.sub_topic;
        return {
            ...d,
        };
    });
    console.log("totalquestions ___> ", count);
    return processeddata;
};
exports.changeUserid = changeUserid;
const bulkQuestionCreate = async (bulkData) => {
    const result = await index_1.default.questions.createMany({
        data: bulkData,
        skipDuplicates: true, // Optional: skips records with duplicate unique keys
    });
    console.log("result", result);
    if (!result) {
        throw new Error("question not created");
    }
};
exports.bulkQuestionCreate = bulkQuestionCreate;
