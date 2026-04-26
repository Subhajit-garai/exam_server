import { relations, sql } from 'drizzle-orm';
import cuid from 'cuid';
import { boolean, doublePrecision, foreignKey, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

import { UserRole, SocialPlatform, primeStatus } from './enums.js';
import { questions } from './question.js';

export const users = pgTable('users', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	name: text('name').notNull(),
	avater: text('avater'),
	email: text('email').notNull().unique(),
	contact_no: text('contact_no').default("0000000000"),
	password: text('password').notNull(),
	targeted_exam_id: text('targeted_exam_id').default("not set"),
	exam_year_id: text('exam_year_id').default("not set"),
	academic_profile: jsonb('academic_profile'),
	school: text('school'),
	standard: text('standard'),
	stream: text('stream'),
	role: UserRole('role').notNull().default("User"),
	join_at: timestamp('join_at', { precision: 3 }).notNull().defaultNow(),
	forgot_password_token: text('forgot_password_token'),
	reset_token_expires: timestamp('reset_token_expires', { precision: 3 }).notNull().defaultNow(),
	access_tokens: text('access_tokens').array().notNull().default([]),
	is_online: boolean('is_online').notNull(),
	last_seen: timestamp('last_seen', { precision: 3 }).notNull().defaultNow()
});

export const usersRelations = relations(users, ({ one, many }) => ({
	socials: many(socials),
	prime: one(primes, {
		fields: [users.id],
		references: [primes.user_id]
	}),
	balance: one(balances, {
		fields: [users.id],
		references: [balances.user_id]
	}),
	answers: many(user_answers),
	notifications: many(notifications)
}));


export const socials = pgTable('socials', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	platform: SocialPlatform('platform').notNull(),
	link: text('link').notNull(),
	is_verified: boolean('is_verified').notNull(),
	updated_at: timestamp('updated_at', { precision: 3 }).notNull()
}, (table) => ({
	user_platform_unique_idx: uniqueIndex('socials_user_id_platform_key').on(table.user_id, table.platform),
	platform_link_unique_idx: uniqueIndex('socials_platform_link_key').on(table.platform, table.link)
}));

export const socialsRelations = relations(socials, ({ one }) => ({
	user: one(users, {
		fields: [socials.user_id],
		references: [users.id]
	})
}));


export const primes = pgTable('primes', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	status: primeStatus('status').notNull().default("None"),
	user_id: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	expiry_in_day: integer('expiry_in_day'),
	expiry: timestamp('expiry', { precision: 3 }).notNull().defaultNow(),
	updated_at: timestamp('updated_at', { precision: 3 }).notNull().defaultNow()
});

export const primesRelations = relations(primes, ({ one }) => ({
	user: one(users, {
		fields: [primes.user_id],
		references: [users.id]
	})
}));


export const balances = pgTable('balances', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	user_id: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	amount: integer('amount').notNull(),
	ticket: integer('ticket').notNull(),
	last_update: timestamp('last_update', { precision: 3 }).notNull()
});

export const balancesRelations = relations(balances, ({ one }) => ({
	user: one(users, {
		fields: [balances.user_id],
		references: [users.id]
	})
}));


export const user_answers = pgTable('user_answers', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	number: integer('number').notNull(),
	part: text('part').notNull().default("part1"),
	exam_id: text('exam_id').notNull(),
	user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	question_id: text('question_id').notNull().default("not set").references(() => questions.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	shuffle_map: integer('shuffle_map').array().notNull(),
	selected_option: text('selected_option').array().notNull(),
	is_correct: boolean('is_correct'),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow()
}, (table) => ({
	exam_user_question_unique_idx: uniqueIndex('user_answers_exam_id_user_id_question_id_key').on(table.exam_id, table.user_id, table.question_id)
}));

export const user_answersRelations = relations(user_answers, ({ one }) => ({
	user: one(users, {
		fields: [user_answers.user_id],
		references: [users.id]
	}),
	question: one(questions, {
		fields: [user_answers.question_id],
		references: [questions.id]
	})
}));


export const notifications = pgTable('notifications', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	title: text('title').notNull(),
	message: text('message').notNull(),
	link: text('link'),
	type: text('type').notNull(),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
	seen: boolean('seen').notNull(),
	seen_at: timestamp('seen_at', { precision: 3 })
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
	user: one(users, {
		fields: [notifications.user_id],
		references: [users.id]
	})
}));



