import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const preferences = pgTable("preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  topic: varchar("topic", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const feedCache = pgTable("feed_cache", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  contentJson: jsonb("content_json").notNull(),
  generatedAt: timestamp("generated_at").notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Preference = typeof preferences.$inferSelect;
export type InsertPreference = typeof preferences.$inferInsert;
export type FeedCache = typeof feedCache.$inferSelect;
export type InsertFeedCache = typeof feedCache.$inferInsert;