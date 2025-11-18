"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sql_1 = require("@repo/prisma/sql");
const index_1 = __importDefault(require("@repo/db/index"));
const main = async () => {
    try {
        let res = await index_1.default.$queryRawTyped((0, sql_1.remove_all_tables)());
        console.log("responce fro removing all tables ", res);
    }
    catch (error) {
        console.log("error in removing all tables ", error);
    }
};
const oneTableData = async () => {
    try {
        //  let res = await prisma.questions.deleteMany({
        //    where:{
        //       topic:"NETWORK"
        //    }
        //  })
        //  console.log("responce fro removing  tables  data" , res);
        // remove all from mcok_question_map
        // await prisma.mock_question_map.deleteMany({})
    }
    catch (error) {
        console.log("error in removing all tables ", error);
    }
};
// oneTableData()
main();
