import { relations, sql } from 'drizzle-orm';
import { boolean, doublePrecision, foreignKey, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

import { ExamStatus } from './enums.js';
import { exam_years } from './exam.js';
import cuid from 'cuid';

export const exam_timelines = pgTable('exam_timelines', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	title: text('title').notNull(),
	date: timestamp('date', { precision: 3 }).notNull(),
	description: text('description'),
	status: ExamStatus('status').notNull(),
	notification: text('notification'),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
	updated_at: timestamp('updated_at', { precision: 3 }).notNull(),
	exam_year_id: text('exam_year_id').notNull().references(() => exam_years.id, { onDelete: 'cascade', onUpdate: 'cascade' })
});

export const exam_timelinesRelations = relations(exam_timelines, ({ one }) => ({
	exam_year: one(exam_years, {
		fields: [exam_timelines.exam_year_id],
		references: [exam_years.id]
	})
}));


