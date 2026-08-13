import { relations, sql } from 'drizzle-orm';
import { boolean, doublePrecision, foreignKey, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

import { topics } from './note.js';

export const related_topics = pgTable('related_topics', {
	topic_a_id: text('topic_a_id').notNull().references(() => topics.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	topic_b_id: text('topic_b_id').notNull().references(() => topics.id, { onDelete: 'cascade', onUpdate: 'cascade' })
}, (table) => ({
	pk: primaryKey({ columns: [table.topic_a_id, table.topic_b_id] }),
}));

export const related_topicsRelations = relations(related_topics, ({ one }) => ({
	topic_a: one(topics, {
		fields: [related_topics.topic_a_id],
		references: [topics.id],
		relationName: 'topics_related_topics_a'
	}),
	topic_b: one(topics, {
		fields: [related_topics.topic_b_id],
		references: [topics.id],
		relationName: 'topics_related_topics_b'
	}),
}));



