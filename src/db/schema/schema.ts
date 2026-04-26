import { relations, sql } from 'drizzle-orm';
import { boolean, doublePrecision, foreignKey, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import cuid from 'cuid';

import { topics } from './note.js';
import { users } from './user.js';

export const comments = pgTable('comments', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	content: text('content').notNull(),
	topic_id: text('topic_id').notNull().references(() => topics.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	author_id: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow()
});

export const commentsRelations = relations(comments, ({ one }) => ({
	topic: one(topics, {
		fields: [comments.topic_id],
		references: [topics.id]
	}),
	author: one(users, {
		fields: [comments.author_id],
		references: [users.id]
	})
}));


export const app_configs = pgTable('app_configs', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	feature: text('feature').notNull().unique(),
	settings: jsonb('settings').notNull(),
	updated_at: timestamp('updated_at', { precision: 3 }).notNull()
});

export const entry_charge_lists = pgTable('entry_charge_lists', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	type: text('type').notNull().default("not set"),
	charge: integer('charge').notNull(),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
	created_by: text('created_by')
});

export const contest_registers = pgTable('contest_registers', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	exam_id: text('exam_id').default("new_value_not_seted"),
	count: integer('count').notNull(),
	users: text('users').array().notNull().default([])
});


