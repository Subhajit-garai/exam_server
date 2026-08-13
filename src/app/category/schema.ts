import { relations, sql } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import cuid from 'cuid';

import { subjects } from '../note/schema.js';
import { exam_patterns, target_exams } from '../exam/schema.js';

export const categories = pgTable('categories', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	name: text('name').notNull().unique(),
	slug: text('slug').notNull().unique(),
	short_name: text('short_name').unique(),
	description: text('description'),
	icon_url: text('icon_url'),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
	updated_at: timestamp('updated_at', { precision: 3 }).notNull()
});

export const categoriesRelations = relations(categories, ({ many }) => ({
	subjects: many(subjects),
	exam_patterns: many(exam_patterns),
	target_exams: many(target_exams)
}));
