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

import { Platform, check, syllabusType, ExamType } from "@/db/enums.js";
import { syllabuses } from "../syllabus/schema.js";
import { users } from "../user/schema.js";

export const bot_quiz_configs = pgTable("bot_quiz_configs", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => cuid()),
  title: text("title").unique(),
  chat_id: text("chat_id"),
  platform: Platform("platform").notNull().default("NONE"),
  check: check("check").default("Normal"),
  syllabus_id: text("syllabus_id").references(() => syllabuses.id),
  syllabus: syllabusType("syllabus").notNull().default("Syllabus"),
  topics: text("topics").array().notNull(),
  exam: text("exam"),
  next_question_time: integer("next_question_time").notNull().default(40),
  quiz_open_for: integer("quiz_open_for").notNull().default(60),
  variable_delay: boolean("variable_delay").notNull(),
  shuffle_questions: boolean("shuffle_questions").notNull().default(true),
  total_questions: integer("total_questions").notNull(),
  marks_value: integer("marks_value").notNull().default(1),
  neg_value: integer("neg_value").notNull(),
  is_multiple_answers: boolean("is_multiple_answers").notNull(),
  waiting_time: integer("waiting_time").notNull().default(10),
  created_by: text("created_by").references(() => users.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  created_at: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
});

export const bot_quiz_configsRelations = relations(
  bot_quiz_configs,
  ({ one }) => ({
    author: one(users, {
      fields: [bot_quiz_configs.created_by],
      references: [users.id],
    }),
    syllabus: one(syllabuses, {
      fields: [bot_quiz_configs.syllabus_id],
      references: [syllabuses.id],
    }),
  }),
);

export const bot_infos = pgTable("bot_infos", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => cuid()),
  bot_user_id: text("bot_user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  token: text("token").notNull(),
  webhook: jsonb("webhook"),
});

export const bot_infosRelations = relations(bot_infos, ({ one }) => ({
  user: one(users, {
    fields: [bot_infos.bot_user_id],
    references: [users.id],
  }),
}));
