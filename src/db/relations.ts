import { relations } from "drizzle-orm";
import { users, preferences, feedCache } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  preferences: many(preferences),
  feedCaches: many(feedCache),
}));

export const preferencesRelations = relations(preferences, ({ one }) => ({
  user: one(users, {
    fields: [preferences.userId],
    references: [users.id],
  }),
}));

export const feedCacheRelations = relations(feedCache, ({ one }) => ({
  user: one(users, {
    fields: [feedCache.userId],
    references: [users.id],
  }),
}));