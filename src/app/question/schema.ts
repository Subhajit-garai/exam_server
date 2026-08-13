import { relations, sql } from 'drizzle-orm';
import cuid from 'cuid';
import { boolean, doublePrecision, foreignKey, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

import { diffcultlevel, Status, examformat, ProcessingStatus } from '../../db/schema/enums.js';
import { subjects, categories, topics } from '../note/schema.js';
import { users } from '../user/schema.js';
import { exams } from '../exam/schema.js';

export const questions = pgTable('questions', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	title: text('title').notNull(),
	options: text('options').array().notNull(),
	old_topic: text('old_topic').notNull(),
	old_sub_topic: text('old_sub_topic').notNull(),
	extra: jsonb('extra'),
	ans: text('ans').array().notNull(),
	topic_id: text('topic_id').references(() => topics.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	subject_id: text('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	format: examformat('format').notNull().default("Text"),
	category: text('category').notNull(),
	category_id: text('category_id').references(() => categories.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	difficulty: diffcultlevel('difficulty').notNull(),
	is_multiple_answers: boolean('is_multiple_answers').notNull(),
	history: text('history').array().notNull().default([""]),
	explanation: text('explanation').default("no explanation added"),
	links: text('links').array().notNull().default([""]),
	status: Status('status').notNull().default("Processing"),
	weight: integer('weight').notNull(),
	created_by: text('created_by').notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow()
});

export const questionsRelations = relations(questions, ({ one, many }) => ({
	subject: one(subjects, {
		fields: [questions.subject_id],
		references: [subjects.id]
	}),
	topic: one(topics, {
		fields: [questions.topic_id],
		references: [topics.id]
	}),
	category: one(categories, {
		fields: [questions.category_id],
		references: [categories.id]
	}),
	author: one(users, {
		fields: [questions.created_by],
		references: [users.id]
	}),
	exam_maps: many(question_maps)
}));

export const question_maps = pgTable('question_maps', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	number: integer('number').notNull(),
	question_id: text('question_id').notNull().references(() => questions.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	part: text('part').notNull().default("part1"),
	exam_id: text('exam_id').references(() => exams.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
	updated_at: timestamp('updated_at', { precision: 3 }).notNull().defaultNow()
}, (table) => ({
	exam_question_part_unique_idx: uniqueIndex('question_maps_exam_id_question_id_part_key').on(table.exam_id, table.question_id, table.part)
}));

export const question_mapsRelations = relations(question_maps, ({ one }) => ({
	exam: one(exams, {
		fields: [question_maps.exam_id],
		references: [exams.id]
	}),
	question: one(questions, {
		fields: [question_maps.question_id],
		references: [questions.id]
	})
}));

export const question_processing = pgTable('question_processing', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	title: text('title').notNull(),
	options: text('options').array().notNull(),
	old_topic: text('old_topic'),
	old_sub_topic: text('old_sub_topic'),
	extra: jsonb('extra'),
	ans: text('ans').array().notNull(),
	topic_id: text('topic_id').notNull().references(() => topics.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	subject_id: text('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	format: examformat('format').notNull().default("Text"),
	category: text('category').notNull(),
	difficulty: diffcultlevel('difficulty').notNull(),
	is_multiple_answers: boolean('is_multiple_answers').notNull(),
	history: text('history').array().notNull().default([""]),
	explanation: text('explanation').default("no explanation added"),
	links: text('links').array().notNull().default([""]),
	status: Status('status').notNull().default("Processing"),
	weight: integer('weight').notNull(),
	created_by: text('created_by').notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
	question_id: text('question_id').references(() => questions.id, { onDelete: 'set null', onUpdate: 'cascade' }),
	processing_status: ProcessingStatus('processing_status').notNull().default("Pending"),
	admin_comment: text('admin_comment'),
	processed_by: text('processed_by').references(() => users.id, { onDelete: 'set null', onUpdate: 'cascade' }),
	processed_at: timestamp('processed_at', { precision: 3 })
});

export const question_processingRelations = relations(question_processing, ({ one }) => ({
	topic: one(topics, {
		fields: [question_processing.topic_id],
		references: [topics.id]
	}),
	subject: one(subjects, {
		fields: [question_processing.subject_id],
		references: [subjects.id]
	}),
	author: one(users, {
		fields: [question_processing.created_by],
		references: [users.id]
	}),
	processor: one(users, {
		fields: [question_processing.processed_by],
		references: [users.id]
	}),
	question: one(questions, {
		fields: [question_processing.question_id],
		references: [questions.id]
	})
}));
