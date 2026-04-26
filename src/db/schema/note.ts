import { relations, sql } from 'drizzle-orm';
import { boolean, doublePrecision, foreignKey, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import cuid from 'cuid';

import { TopicStatus } from './enums.js';
import { users } from './user.js';
import { exam_patterns, target_exams } from './exam.js';


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


export const subjects = pgTable('subjects', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	order: integer('order').notNull().unique(),
	name: text('name').notNull().unique(),
	short_name: text('short_name').unique(),
	description: text('description').default("No description provided"),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
	updated_at: timestamp('updated_at', { precision: 3 }).notNull(),
	slug: text('slug').notNull().unique(),
	icon_url: text('icon_url'),
	color: text('color'),
	is_public: boolean('is_public').notNull().default(true),
	category: text('category').notNull(),
	category_id: text('category_id').references(() => categories.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	level: text('level'),
	difficulty: integer('difficulty')
});

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
	category: one(categories, {
		fields: [subjects.category_id],
		references: [categories.id]
	}),
	topics: many(topics)
}));


export const topics = pgTable('topics', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	name: text('name').notNull().unique(),
	subject_id: text('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	is_parent_topic: boolean('is_parent_topic').notNull(),
	parent_topic_id: text('parent_topic_id').references((): any => topics.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	short_name: text('short_name').unique(),
	order: integer('order').notNull().default(100),
	description: text('description').default("No description provided"),
	slug: text('slug').notNull().unique(),
	icon_url: text('icon_url'),
	color: text('color'),
	tags: text('tags').array().notNull().default([]),
	content: text('content').notNull().default("no content added "),
	like: integer('like').notNull(),
	dis_like: integer('dislike').notNull(),
	read_count: integer('read_count').notNull(),
	comments: integer('comments').notNull(),
	is_public: boolean('is_public').notNull(),
	comment_enabled: boolean('comment_enabled').notNull().default(true),
	verified: boolean('verified').notNull(),
	estimated_read_time: integer('estimated_read_time'),
	version: integer('version').notNull().default(100),
	attachments: text('attachments').array().notNull().default([]),
	published_at: timestamp('published_at', { precision: 3 }),
	language: text('language'),
	status: TopicStatus('status').notNull().default("draft"),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
	updated_at: timestamp('updated_at', { precision: 3 }).notNull(),
	created_by: text('created_by').references(() => users.id, { onDelete: 'set null', onUpdate: 'cascade' }),
	updated_by: text('updated_by')
}, (table) => ({
	subject_order_unique_idx: uniqueIndex('topics_subject_id_order_key').on(table.subject_id, table.order)
}));

export const topicsRelations = relations(topics, ({ one, many }) => ({
	subject: one(subjects, {
		fields: [topics.subject_id],
		references: [subjects.id]
	}),
	parent_topic: one(topics, {
		fields: [topics.parent_topic_id],
		references: [topics.id],
		relationName: 'topics_parent_topic'
	}),
	sub_topics: many(topics, {
		relationName: 'topics_parent_topic'
	}),
	versions: many(topic_note_versions),
	author: one(users, {
		fields: [topics.created_by],
		references: [users.id]
	})
}));


export const topic_note_versions = pgTable('topic_note_versions', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	topic_id: text('topic_id').notNull().references(() => topics.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	content: text('content'),
	version: integer('version'),
	attachments: text('attachments').array().notNull().default([]),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow()
});

export const topic_note_versionsRelations = relations(topic_note_versions, ({ one }) => ({
	topic: one(topics, {
		fields: [topic_note_versions.topic_id],
		references: [topics.id]
	})
}));



