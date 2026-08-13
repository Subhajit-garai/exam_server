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
import { nanoid } from "nanoid";

import { quiz_type, ExamStage, CreationTypes, Visibility } from "@/db/enums.js";
import { users } from "../user/schema.js";
import { questions } from "../question/schema.js";

export const quizzes = pgTable("quizzes", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => cuid()),
  display_id: text("display_id")
    .unique()
    .$defaultFn(() => nanoid(6)),
  quiz_register_id: text("quiz_register_id")
    .default("Private quiz")
    .references((): any => quiz_registers.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  is_need_registration: boolean("is_need_registration").notNull(),
  name: text("name").default("No name"),
  category: text("category").notNull(),
  topics: text("topics").array().notNull().default([""]),
  subjects: text("subjects").array().notNull().default([""]),
  created_at: timestamp("created_at", { precision: 3 }).defaultNow(),
  created_by: text("created_by")
    .notNull()
    .default("No name")
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  visibility: Visibility("visibility").notNull().default("Private"),
  creation_status: CreationTypes("creation_status")
    .notNull()
    .default("Processing"),
  start_time: text("start_time").default("00:00 pm"),
  end_time: text("end_time").notNull().default("00:00 h"),
  next_question_time: integer("next_question_time").notNull().default(40),
  quiz_open_for: integer("quiz_open_for").notNull().default(60),
  question_count: integer("question_count").notNull(),
  quiz_type: quiz_type("quiz_type").notNull().default("quiz"),
  chat_id: text("chat_id"),
  date: timestamp("date", { precision: 3 }).notNull().defaultNow(),
  stage: ExamStage("stage").notNull().default("Registration"),
});

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  register: one(quiz_registers, {
    fields: [quizzes.quiz_register_id],
    references: [quiz_registers.id],
  }),
  author: one(users, {
    fields: [quizzes.created_by],
    references: [users.id],
  }),
  question_maps: many(quiz_question_maps),
}));

export const quiz_question_maps = pgTable(
  "quiz_question_maps",
  {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => cuid()),
    number: integer("number").notNull(),
    question_id: text("question_id")
      .notNull()
      .references(() => questions.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    quiz_id: text("quiz_id").references(() => quizzes.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    created_at: timestamp("created_at", { precision: 3 })
      .notNull()
      .defaultNow(),
    updated_at: timestamp("updated_at", { precision: 3 })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    quiz_question_unique_idx: uniqueIndex(
      "quiz_question_maps_quiz_id_question_id_key",
    ).on(table.quiz_id, table.question_id),
  }),
);

export const quiz_question_mapsRelations = relations(
  quiz_question_maps,
  ({ one }) => ({
    quiz: one(quizzes, {
      fields: [quiz_question_maps.quiz_id],
      references: [quizzes.id],
    }),
    question: one(questions, {
      fields: [quiz_question_maps.question_id],
      references: [questions.id],
    }),
  }),
);

export const quiz_registers = pgTable("quiz_registers", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => cuid()),
  quiz_id: text("quiz_id").unique().default("new_value_not_seted"),
  count: integer("count").notNull(),
  users: text("users").array().notNull().default([]),
});

export const quiz_registersRelations = relations(quiz_registers, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quiz_registers.quiz_id],
    references: [quizzes.id],
  }),
}));
