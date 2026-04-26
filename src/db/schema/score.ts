import { relations, sql } from 'drizzle-orm';
import cuid from 'cuid';
import { boolean, doublePrecision, foreignKey, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

import { exams } from './exam.js';
import { users } from './user.js';

export const timescale_scores = pgTable('timescale_scores', {
	id: text('id').notNull().$defaultFn(() => cuid()),
	user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	exam_id: text('exam_id').notNull().references(() => exams.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	score: integer('score').notNull(),
	not_attempt: integer('not_attempt'),
	topic_wise_result: jsonb('topic_wise_result'),
	result: jsonb('result'),
	time: timestamp('time', { precision: 3 }).notNull().defaultNow()
}, (table) => ({
	user_exam_time_unique_idx: uniqueIndex('timescale_scores_user_id_exam_id_time_key').on(table.user_id, table.exam_id, table.time),
	cpk: primaryKey({ name: 'timescale_scores_cpk', columns: [table.id, table.time] }),
}));

export const timescale_scoresRelations = relations(timescale_scores, ({ one }) => ({
	user: one(users, {
		fields: [timescale_scores.user_id],
		references: [users.id]
	}),
	exam: one(exams, {
		fields: [timescale_scores.exam_id],
		references: [exams.id]
	})
}));


export const scores = pgTable('scores', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	exam_id: text('exam_id').notNull().references(() => exams.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	leaderboard_id: text('leaderboard_id').notNull().$defaultFn(() => cuid()),
	not_attempt: integer('not_attempt'),
	score: integer('score').notNull(),
	total_questions: integer('total_questions').notNull(),
	topic_wise_result: jsonb('topic_wise_result'),
	result: jsonb('result'),
	time: timestamp('time', { precision: 3 }).notNull().defaultNow()
}, (table) => ({
	user_exam_time_unique_idx: uniqueIndex('scores_user_id_exam_id_time_key').on(table.user_id, table.exam_id, table.time)
}));

export const scoresRelations = relations(scores, ({ one }) => ({
	user: one(users, {
		fields: [scores.user_id],
		references: [users.id]
	}),
	exam: one(exams, {
		fields: [scores.exam_id],
		references: [exams.id]
	})
}));


export const leaderboards = pgTable('leaderboards', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	user_id: text('user_id').references(() => users.id, { onDelete: 'set null', onUpdate: 'cascade' }),
	exam_id: text('exam_id').notNull().references(() => exams.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	rank: integer('rank').notNull(),
	score: integer('score').notNull(),
	time: timestamp('time', { precision: 3 }).notNull().defaultNow()
}, (table) => ({
	user_exam_time_unique_idx: uniqueIndex('leaderboards_user_id_exam_id_time_key').on(table.user_id, table.exam_id, table.time)
}));

export const leaderboardsRelations = relations(leaderboards, ({ one }) => ({
	user: one(users, {
		fields: [leaderboards.user_id],
		references: [users.id]
	}),
	exam: one(exams, {
		fields: [leaderboards.exam_id],
		references: [exams.id]
	})
}));



