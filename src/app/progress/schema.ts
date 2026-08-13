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

import { users } from "../user/schema.js";
import { ProgressStatus } from "@/db/enums.js";
import { topics } from "../note/schema.js";

export const exam_progress = pgTable("exam_progress", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => cuid()),
  user_id: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  attended: integer("attended").notNull(),
  total_questions_attempted: integer("total_questions_attempted").notNull(),
  total_correct: integer("total_correct").notNull(),
  accuracy: doublePrecision("accuracy").notNull(),
  last_exam_id: text("last_exam_id"),
  last_exam_date: timestamp("last_exam_date", { precision: 3 }),
  last_rank: integer("last_rank").notNull(),
  best_rank: integer("best_rank").notNull(),
});

export const exam_progressRelations = relations(exam_progress, ({ one }) => ({
  user: one(users, {
    fields: [exam_progress.user_id],
    references: [users.id],
  }),
}));

export const dpp_progress = pgTable("dpp_progress", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => cuid()),
  user_id: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  solved_count: integer("solved_count").notNull(),
  questions_solved: integer("questions_solved").notNull(),
  last_dpp_id: text("last_dpp_id"),
  last_dpp_date: timestamp("last_dpp_date", { precision: 3 }),
  current_streak: integer("current_streak").notNull(),
});

export const dpp_progressRelations = relations(dpp_progress, ({ one }) => ({
  user: one(users, {
    fields: [dpp_progress.user_id],
    references: [users.id],
  }),
}));

export const quiz_progress = pgTable("quiz_progress", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => cuid()),
  user_id: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  attended: integer("attended").notNull(),
  total_score: integer("total_score").notNull(),
  last_quiz_id: text("last_quiz_id"),
  last_quiz_date: timestamp("last_quiz_date", { precision: 3 }),
});

export const quiz_progressRelations = relations(quiz_progress, ({ one }) => ({
  user: one(users, {
    fields: [quiz_progress.user_id],
    references: [users.id],
  }),
}));

export const user_topic_progress = pgTable(
  "user_topic_progress",
  {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => cuid()),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    topic_id: text("topic_id")
      .notNull()
      .references(() => topics.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    time_spent: integer("time_spent").notNull(),
    status: ProgressStatus("status").notNull().default("NOT_STARTED"),
    last_read_at: timestamp("last_read_at", { precision: 3 })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    user_topic_unique_idx: uniqueIndex(
      "user_topic_progress_user_id_topic_id_key",
    ).on(table.user_id, table.topic_id),
  }),
);

export const user_topic_progressRelations = relations(
  user_topic_progress,
  ({ one }) => ({
    user: one(users, {
      fields: [user_topic_progress.user_id],
      references: [users.id],
    }),
    topic: one(topics, {
      fields: [user_topic_progress.topic_id],
      references: [topics.id],
    }),
  }),
);
