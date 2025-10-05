import prisma from "../db/index";
import {
  eventRuns,
  eventType,
  ExamStatus,
  ExamType,
  primeStatus,
  Prisma,
  purchaseType,
  UserRole,
} from "@prisma/client";
import {
  Createhash,
  generateResetToken,
  hashPasswordFn,
  veryfyhashPasswordFn,
} from "../lib/hash";

import fs from "fs";
import path from "path";
import { createOrUpdateTier } from "../src/controllers/tier.controller";
import { sendBulkMockAndPyqData } from "./DB_setup/Tables/MockAndPyqLoader";
import { settings } from "./DB_setup/Tables/settings";

import { getDiscountPercent } from "../lib/helper/payment";

const main = async () => {



  
 



  console.log("data added successfully");
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
