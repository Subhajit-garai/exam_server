import { relations, sql } from 'drizzle-orm';
import { boolean, doublePrecision, foreignKey, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import cuid from 'cuid';

import { ProcessingStatus, diffcultlevel, Status, examformat } from './enums.js';
import { subjects, topics } from './note.js';
import { users } from './user.js';
import { questions } from './question.js';

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


