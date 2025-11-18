"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.entryCharges = void 0;
const client_1 = require("@repo/prisma/client");
const index_1 = __importDefault(require("@repo/db/index"));
const entryCharges = async (userid) => {
    const Exam_EntryChargeList = await index_1.default.entryChargeList.create({
        data: {
            type: client_1.ExamType.Test,
            Charge: 10,
            created_by: userid,
        },
    });
    const Subject_EntryChargeList = await index_1.default.entryChargeList.create({
        data: {
            type: client_1.ExamType.Subject,
            Charge: 10,
            created_by: userid,
        },
    });
    const Contest_EntryChargeList = await index_1.default.entryChargeList.create({
        data: {
            type: client_1.ExamType.Contest,
            Charge: 10,
            created_by: userid,
        },
    });
    const Dpp_EntryChargeList = await index_1.default.entryChargeList.create({
        data: {
            type: client_1.ExamType.Dpp,
            Charge: 5,
            created_by: userid,
        },
    });
    const Mock_EntryChargeList = await index_1.default.entryChargeList.create({
        data: {
            type: client_1.ExamType.Mock,
            Charge: 20,
            created_by: userid,
        },
    });
    const PYQ_EntryChargeList = await index_1.default.entryChargeList.create({
        data: {
            type: client_1.ExamType.PYQ,
            Charge: 15,
            created_by: userid,
        },
    });
};
exports.entryCharges = entryCharges;
