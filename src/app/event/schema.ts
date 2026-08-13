import { relations, sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  foreignKey,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import cuid from "cuid";

import { eventType, eventRuns, UserRole } from "@/db/enums.js";

export const events = pgTable("events", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => cuid()),
  type: eventType("type").notNull(),
  description: text("description").notNull(),
  payload: jsonb("payload").$type<Record<string, any>>().notNull(),
  conditions: jsonb("conditions")
    .$type<Record<string, any>>()
    .notNull()
    .default({}),
  is_active: boolean("is_active").notNull().default(true),
  created_by: UserRole("created_by").notNull().default("Bot"),
  created_at: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
  runs: eventRuns("runs").notNull().default("ONE"),
  run_at: text("run_at").notNull(),
});
