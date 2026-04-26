import { relations, sql } from 'drizzle-orm';
import { boolean, doublePrecision, foreignKey, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import cuid from 'cuid';

import { IssueType, Status, UserRole } from './enums.js';
import { users } from './user.js';

export const issues = pgTable('issues', {
	id: text('id').notNull().primaryKey().$defaultFn(() => cuid()),
	type: IssueType('type').notNull(),
	sub_type: text('sub_type').default("General"),
	note: text('note'),
	issue_details: jsonb('issue_details').notNull(),
	status: Status('status').notNull().default("Created"),
	up_vote: integer('up_vote').notNull(),
	down_vote: integer('down_vote').notNull(),
	priority_vote: integer('priority_vote').notNull(),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
	creator_role: UserRole('creator_role').notNull().default("User"),
	created_by: text('created_by').references(() => users.id, { onDelete: 'set null', onUpdate: 'cascade' })
});

export const issuesRelations = relations(issues, ({ one }) => ({
	author: one(users, {
		fields: [issues.created_by],
		references: [users.id]
	})
}));



