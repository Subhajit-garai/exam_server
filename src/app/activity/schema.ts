import { relations } from "drizzle-orm";
import cuid from "cuid";
import {
  foreignKey,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { ActivityType, BadgeRule } from "@/db/enums.js";
import { users } from "../user/schema.js";

export const daily_challenges = pgTable("daily_challenges", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => cuid()),
  date: timestamp("date", { precision: 3 }).notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  xp: integer("xp").notNull(),
  created_by: text("created_by"),
  created_at: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { precision: 3 }).notNull(),
});

export const daily_challengesRelations = relations(
  daily_challenges,
  ({ many }) => ({
    // Add relations if needed later (e.g. users who completed it)
  }),
);

export const user_activities = pgTable("user_activities", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => cuid()),
  user_id: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  date: timestamp("date", { precision: 3 }).notNull(),
  type: ActivityType("type").notNull(),
  meta: jsonb("meta"),
  xp: integer("xp").notNull(),
  created_at: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
});

export const user_activitiesRelations = relations(
  user_activities,
  ({ one }) => ({
    user: one(users, {
      fields: [user_activities.user_id],
      references: [users.id],
    }),
  }),
);

export const user_streaks = pgTable("user_streaks", {
  user_id: text("user_id")
    .notNull()
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  streak: integer("streak").notNull(),
  max_streak: integer("max_streak").notNull(),
  last_activity: timestamp("last_activity", { precision: 3 }),
  updated_at: timestamp("updated_at", { precision: 3 }).notNull(),
});

export const user_streaksRelations = relations(user_streaks, ({ one }) => ({
  user: one(users, {
    fields: [user_streaks.user_id],
    references: [users.id],
  }),
}));

export const badges = pgTable("badges", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => cuid()),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  icon: text("icon"),
  rule_type: BadgeRule("rule_type").notNull(),
  condition: jsonb("condition").notNull(),
  xp_bonus: integer("xp_bonus").notNull(),
  created_at: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { precision: 3 }).notNull(),
});

export const user_badges = pgTable(
  "user_badges",
  {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => cuid()),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    badge_id: text("badge_id")
      .notNull()
      .references(() => badges.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    earned_at: timestamp("earned_at", { precision: 3 }).notNull().defaultNow(),
  },
  (table) => ({
    user_badge_unique_idx: uniqueIndex("user_badges_user_id_badge_id_key").on(
      table.user_id,
      table.badge_id,
    ),
  }),
);

export const user_badgesRelations = relations(user_badges, ({ one }) => ({
  user: one(users, {
    fields: [user_badges.user_id],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [user_badges.badge_id],
    references: [badges.id],
  }),
}));

export const activity_leaderboards = pgTable(
  "activity_leaderboards",
  {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => cuid()),
    date: timestamp("date", { precision: 3 }).notNull(),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    rank: integer("rank").notNull(),
    score: integer("score").notNull(),
    type: text("type").notNull().default("daily"),
    created_at: timestamp("created_at", { precision: 3 })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    date_user_type_unique_idx: uniqueIndex(
      "activity_leaderboards_date_user_id_type_key",
    ).on(table.date, table.user_id, table.type),
  }),
);

export const activity_leaderboardsRelations = relations(
  activity_leaderboards,
  ({ one }) => ({
    user: one(users, {
      fields: [activity_leaderboards.user_id],
      references: [users.id],
    }),
  }),
);
