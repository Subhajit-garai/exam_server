import { relations, sql } from 'drizzle-orm';
import cuid from 'cuid';
import { boolean, doublePrecision, foreignKey, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

import { telegramgroupType, ban_status } from './enums.js';

export const telegram_group_infos = pgTable('telegram_group_infos', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	group_id: text('group_id').notNull().unique(),
	group_name: text('group_name').notNull(),
	group_type: telegramgroupType('group_type').notNull().default("group"),
	group_link: text('group_link'),
	is_topic: boolean('is_topic').notNull(),
	is_premium: boolean('is_premium').notNull(),
	admin_ids: text('admin_ids').array().notNull(),
	is_banned: boolean('is_banned').notNull(),
	last_active_at: timestamp('last_active_at', { precision: 3 }),
	message_count: integer('message_count').notNull(),
	quiz_count: integer('quiz_count').notNull(),
	language: text('language').notNull().default("en"),
	timezone: text('timezone'),
	features: jsonb('features'),
	group_status: text('group_status').default("open"),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow()
});

export const telegram_group_infosRelations = relations(telegram_group_infos, ({ many }) => ({
	topics: many(telegram_group_topics)
}));


export const telegram_group_topics = pgTable('telegram_group_topics', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	name: text('name').notNull(),
	topic_id: integer('topic_id').notNull(),
	group_id: text('group_id').notNull().references(() => telegram_group_infos.id, { onDelete: 'cascade', onUpdate: 'cascade' })
});

export const telegram_group_topicsRelations = relations(telegram_group_topics, ({ one }) => ({
	group: one(telegram_group_infos, {
		fields: [telegram_group_topics.group_id],
		references: [telegram_group_infos.id]
	})
}));


export const telegram_ban_users = pgTable('telegram_ban_users', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	bot_id: text('bot_id').notNull(),
	user_telegram_id: text('user_telegram_id').notNull(),
	ban_from_type: text('ban_from_type').notNull(),
	ban_from_id: text('ban_from_id').notNull(),
	status: ban_status('status').notNull().default("Ban"),
	at: timestamp('at', { precision: 3 }).notNull().defaultNow()
}, (table) => ({
	user_ban_unique_idx: uniqueIndex('telegram_ban_users_user_telegram_id_ban_from_id_key').on(table.user_telegram_id, table.ban_from_id)
}));


