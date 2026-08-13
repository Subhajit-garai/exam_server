import { relations, sql } from "drizzle-orm";
import cuid from "cuid";
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

import { SyllabusType } from "@/db/enums.js";
import { exam_years } from "../exam/schema.js";
import { subjects, topics } from "../note/schema.js";

export const syllabuses = pgTable("syllabuses", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => cuid()),
  created_at: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
  type: SyllabusType("type").notNull().default("EXAM"),
  exam_year_id: text("exam_year_id").references(() => exam_years.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  title: text("title").notNull().unique(),
  description: text("description"),
});

export const syllabusesRelations = relations(syllabuses, ({ one, many }) => ({
  exam_year: one(exam_years, {
    fields: [syllabuses.exam_year_id],
    references: [exam_years.id],
  }),
  subject_maps: many(subject_syllabus_maps),
}));

export const subject_syllabus_maps = pgTable(
  "subject_syllabus_maps",
  {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => cuid()),
    syllabus_id: text("syllabus_id")
      .notNull()
      .references(() => syllabuses.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    subject_id: text("subject_id")
      .notNull()
      .references(() => subjects.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    weightage: doublePrecision("weightage"),
    created_at: timestamp("created_at", { precision: 3 })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    syllabus_subject_unique_idx: uniqueIndex(
      "subject_syllabus_maps_syllabus_id_subject_id_key",
    ).on(table.syllabus_id, table.subject_id),
  }),
);

export const subject_syllabus_mapsRelations = relations(
  subject_syllabus_maps,
  ({ one, many }) => ({
    syllabus: one(syllabuses, {
      fields: [subject_syllabus_maps.syllabus_id],
      references: [syllabuses.id],
    }),
    subject: one(subjects, {
      fields: [subject_syllabus_maps.subject_id],
      references: [subjects.id],
    }),
    topic_maps: many(topic_subject_maps),
  }),
);

export const topic_subject_maps = pgTable(
  "topic_subject_maps",
  {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => cuid()),
    subject_map_id: text("subject_map_id")
      .notNull()
      .references(() => subject_syllabus_maps.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    topic_id: text("topic_id")
      .notNull()
      .references(() => topics.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    weightage: doublePrecision("weightage"),
    created_at: timestamp("created_at", { precision: 3 })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    subject_map_topic_unique_idx: uniqueIndex(
      "topic_subject_maps_subject_map_id_topic_id_key",
    ).on(table.subject_map_id, table.topic_id),
  }),
);

export const topic_subject_mapsRelations = relations(
  topic_subject_maps,
  ({ one }) => ({
    subject_map: one(subject_syllabus_maps, {
      fields: [topic_subject_maps.subject_map_id],
      references: [subject_syllabus_maps.id],
    }),
    topic: one(topics, {
      fields: [topic_subject_maps.topic_id],
      references: [topics.id],
    }),
  }),
);
