import { relations, sql } from 'drizzle-orm';
import cuid from 'cuid';
import { boolean, doublePrecision, foreignKey, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

import { ExamScope, ExamStatus, diffcultlevel, check, syllabusType, examformat, access_type, ExamType, ExamStage, CreationTypes, Visibility } from './enums.js';
import { categories } from './note.js';
import { syllabuses } from './syllabus.js';
import { users } from './user.js';
import { contest_registers } from './schema.js';
import { nanoid } from 'nanoid';

export const target_exams = pgTable('target_exams', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	name: text('name').notNull().unique(),
	short_code: text('short_code').unique(),
	description: text('description'),
	exam_scope: ExamScope('exam_scope').notNull().default("NATIONAL"),
	is_public: boolean('is_public').notNull(),
	category_id: text('category_id').references(() => categories.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
	updated_at: timestamp('updated_at', { precision: 3 }).notNull()
});

export const target_examsRelations = relations(target_exams, ({ one, many }) => ({
	category: one(categories, {
		fields: [target_exams.category_id],
		references: [categories.id]
	}),
	years: many(exam_years)
}));


export const exam_years = pgTable('exam_years', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	target_exam_id: text('target_exam_id').notNull().references(() => target_exams.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	year: integer('year').notNull(),
	slug: text('slug').notNull().unique(),
	status: ExamStatus('status').notNull().default("SCHEDULED"),
	is_public: boolean('is_public').notNull(),
	registration_open_date: timestamp('registration_open_date', { precision: 3 }),
	registration_close_date: timestamp('registration_close_date', { precision: 3 }),
	exam_date: timestamp('exam_date', { precision: 3 }),
	result_date: timestamp('result_date', { precision: 3 }),
	notes: jsonb('notes'),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
	updated_at: timestamp('updated_at', { precision: 3 }).notNull(),
	is_deleted: boolean('is_deleted').notNull()
});

export const exam_yearsRelations = relations(exam_years, ({ one }) => ({
	target_exam: one(target_exams, {
		fields: [exam_years.target_exam_id],
		references: [target_exams.id]
	})
}));


export const exam_patterns = pgTable('exam_patterns', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	title: text('title').unique(),
	format: examformat('format').notNull().default("Text"),
	exam_name: text('exam_name').notNull(),
	category_id: text('category_id').references(() => categories.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	syllabus: syllabusType('syllabus').notNull().default("Syllabus"),
	syllabus_id: text('syllabus_id').references(() => syllabuses.id),
	topics: text('topics').array().notNull(),
	difficulty: diffcultlevel('difficulty').notNull().default("Easy"),
	part: boolean('part'),
	checkbox: boolean('checkbox'),
	part_count: integer('part_count').notNull().default(1),
	total_questions: integer('total_questions').array().notNull(),
	check: check('check'),
	marks_values: integer('marks_values').array().notNull(),
	neg_values: integer('neg_values').array().notNull(),
	is_multiple_answers: integer('is_multiple_answers').array().notNull().default([0, 0]),
	created_by: text('created_by').references(() => users.id, { onDelete: 'set null', onUpdate: 'cascade' })
});


export const exam_patternsRelations = relations(exam_patterns, ({ one, many }) => ({
	category: one(categories, {
		fields: [exam_patterns.category_id],
		references: [categories.id]
	}),
	author: one(users, {
		fields: [exam_patterns.created_by],
		references: [users.id]
	}),
	exams: many(exams)
}));


export const exams = pgTable('exams', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	display_id: text('display_id').unique().$defaultFn(() => nanoid(6)),
	name: text('name').default("No name"),
	exam_type: ExamType('examtype').notNull().default("Test"),
	access_type: access_type('access_type').notNull().default("Paid"),
	exam_pattern_id: text('exam_pattern_id').notNull().references(() => exam_patterns.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	is_multiple_attempts: boolean('is_multiple_attempts').notNull().default(true),
	is_live: boolean('is_live').notNull().default(true),
	visibility: Visibility('visibility').notNull().default("Private"),
	creation_status: CreationTypes('creationstatus').notNull().default("Processing"),
	start_time: text('start_time').default("08:00 pm"),
	join_time: text('join_time').default("00:15 m"),
	duration: text('duration').notNull().default("02:00 h"),
	date: timestamp('date', { precision: 3 }).notNull().defaultNow(),
	stage: ExamStage('stage').notNull().default("Registration"),
	register_id: text('register_id').notNull().references(() => contest_registers.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	question_difficulty_weight: jsonb('question_difficulty_weight'),
	question_topic_count: jsonb('question_topic_count'),
	question_part_count: jsonb('question_part_count'),
	created_at: timestamp('created_at', { precision: 3 }).defaultNow(),
	created_by: text('created_by').references(() => users.id, { onDelete: 'set null', onUpdate: 'cascade' })
});


export const examsRelations = relations(exams, ({ one }) => ({
	pattern: one(exam_patterns, {
		fields: [exams.exam_pattern_id],
		references: [exam_patterns.id]
	}),
	register: one(contest_registers, {
		fields: [exams.register_id],
		references: [contest_registers.id]
	}),
	author: one(users, {
		fields: [exams.created_by],
		references: [users.id]
	})
}));



