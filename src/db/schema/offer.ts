import { relations, sql } from 'drizzle-orm';
import { boolean, doublePrecision, foreignKey, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import cuid from 'cuid';

import { purchaseType } from './enums.js';
import { target_exams } from './exam.js';
import { tiers } from './tier.js';

export const subscription_offers = pgTable('subscription_offers', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	marked_price: integer('marked_price').notNull(),
	discount: integer('discount').notNull(),
	type: purchaseType('type').notNull(),
	title: text('title').notNull(),
	price: integer('price').notNull(),
	token: integer('token'),
	is_exam_based: boolean('is_exam_based').notNull(),
	target_exam_id: text('target_exam_id').references(() => target_exams.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	tier_id: text('tier_id').references(() => tiers.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	time: text('time'),
	offer_active: text('offer_active').array().notNull().default([]),
	offer_inactive: text('offer_inactive').array().notNull().default([]),
	btn_color: text('btn_color').notNull(),
	created_by: text('created_by'),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow()
});

export const subscription_offersRelations = relations(subscription_offers, ({ one }) => ({
	target_exam: one(target_exams, {
		fields: [subscription_offers.target_exam_id],
		references: [target_exams.id]
	}),
	tier: one(tiers, {
		fields: [subscription_offers.tier_id],
		references: [tiers.id]
	})
}));



