import { relations, sql } from 'drizzle-orm';
import { boolean, doublePrecision, foreignKey, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import cuid from 'cuid';

import { users } from './user.js';

export const coupons = pgTable('coupons', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	code: text('code').notNull().unique(),
	description: text('description'),
	discount_type: text('discount_type').notNull(),
	discount_value: doublePrecision('discount_value').notNull(),
	max_uses: integer('max_uses'),
	used_count: integer('used_count').notNull(),
	per_user_limit: integer('per_user_limit'),
	min_order_amount: doublePrecision('min_order_amount'),
	expires_at: timestamp('expires_at', { precision: 3 }),
	is_active: boolean('is_active').notNull().default(true),
	created_by: text('created_by').references(() => users.id, { onDelete: 'set null', onUpdate: 'cascade' }),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow()
});

export const couponsRelations = relations(coupons, ({ one, many }) => ({
	created_user: one(users, {
		fields: [coupons.created_by],
		references: [users.id]
	}),
	usages: many(coupon_usages)
}));


export const coupon_usages = pgTable('coupon_usages', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	coupon_id: text('coupon_id').notNull().references(() => coupons.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	used_at: timestamp('used_at', { precision: 3 }).notNull().defaultNow()
}, (table) => ({
	user_coupon_unique_idx: uniqueIndex('coupon_usages_user_id_coupon_id_key').on(table.user_id, table.coupon_id)
}));

export const coupon_usagesRelations = relations(coupon_usages, ({ one }) => ({
	user: one(users, {
		fields: [coupon_usages.user_id],
		references: [users.id]
	}),
	coupon: one(coupons, {
		fields: [coupon_usages.coupon_id],
		references: [coupons.id]
	})
}));



