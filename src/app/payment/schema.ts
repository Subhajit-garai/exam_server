import { relations, sql } from "drizzle-orm";
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
import cuid from "cuid";

import { purchaseType, primeStatus } from "@/db/enums.js";
import { users } from "../user/schema.js";
import { coupons } from "../coupon/schema.js";

export const orders = pgTable("orders", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => cuid()),
  user_id: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  razorpay_order_id: text("razorpay_order_id").notNull().unique(),
  amount: integer("amount").notNull(),
  type: purchaseType("type").notNull().default("TOKEN"),
  token: integer("token"),
  subscription: primeStatus("subscription").default("None"),
  coupon_id: text("coupon_id").references(() => coupons.id),
  status: text("status").notNull().default("pending"),
  created_at: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { precision: 3 }).notNull(),
});

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.user_id],
    references: [users.id],
  }),
  coupon: one(coupons, {
    fields: [orders.coupon_id],
    references: [coupons.id],
  }),
}));

export const payments = pgTable("payments", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => cuid()),
  razorpay_order_id: text("razorpay_order_id").notNull().unique(),
  razorpay_payment_id: text("razorpay_payment_id").notNull().unique(),
  razorpay_signature: text("razorpay_signature").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("INR"),
  status: text("status").notNull().default("pending"),
  created_at: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { precision: 3 }).notNull(),
  user_id: text("user_id").references(() => users.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.user_id],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [payments.razorpay_order_id],
    references: [orders.razorpay_order_id],
  }),
}));
