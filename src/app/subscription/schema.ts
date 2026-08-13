import { relations, sql } from "drizzle-orm";
import cuid from "cuid";
import {
  boolean,
  doublePrecision,
  foreignKey,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { primeStatus, ExamType } from "@/db/enums.js";

export const tiers = pgTable("tiers", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => cuid()),
  name: primeStatus("name").notNull().unique(),
  created_at: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { precision: 3 }).notNull(),
});

export const tiersRelations = relations(tiers, ({ many }) => ({
  benefits: many(tier_benefits),
}));

export const tier_benefits = pgTable(
  "tier_benefits",
  {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => cuid()),
    tier_id: text("tier_id")
      .notNull()
      .references(() => tiers.id, { onDelete: "cascade", onUpdate: "cascade" }),
    feature: ExamType("feature").notNull(),
    access: boolean("access").notNull(),
    limit: integer("limit"),
    used: integer("used"),
    created_at: timestamp("created_at", { precision: 3 })
      .notNull()
      .defaultNow(),
    updated_at: timestamp("updated_at", { precision: 3 }).notNull(),
  },
  (table) => ({
    tier_feature_unique_idx: uniqueIndex(
      "tier_benefits_tier_id_feature_key",
    ).on(table.tier_id, table.feature),
  }),
);

export const tier_benefitsRelations = relations(tier_benefits, ({ one }) => ({
  tier: one(tiers, {
    fields: [tier_benefits.tier_id],
    references: [tiers.id],
  }),
}));
