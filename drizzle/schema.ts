import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Health metrics table - stores real-time health data from Apple Health/Fitness
 */
export const healthMetrics = mysqlTable("healthMetrics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  metricType: mysqlEnum("metricType", [
    "steps",
    "heartRate",
    "calories",
    "distance",
    "activeMinutes",
    "sleepDuration",
    "bloodPressure",
    "bloodOxygen",
  ]).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 32 }).notNull(), // e.g., "steps", "bpm", "kcal", "km", "min", "mmHg", "%"
  recordedAt: timestamp("recordedAt").notNull(),
  syncedAt: timestamp("syncedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HealthMetric = typeof healthMetrics.$inferSelect;
export type InsertHealthMetric = typeof healthMetrics.$inferInsert;

/**
 * Expenses table - stores spending transactions
 */
export const expenses = mysqlTable("expenses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  merchant: varchar("merchant", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  category: mysqlEnum("category", [
    "food",
    "shopping",
    "transport",
    "entertainment",
    "bills",
    "health",
    "other",
  ]).notNull(),
  description: text("description"),
  transactionDate: timestamp("transactionDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

/**
 * Health sync logs - tracks when health data was synced from Apple Health
 */
export const healthSyncLogs = mysqlTable("healthSyncLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  syncStatus: mysqlEnum("syncStatus", ["pending", "success", "failed"]).default("pending").notNull(),
  metricsCount: int("metricsCount").default(0),
  errorMessage: text("errorMessage"),
  syncStartedAt: timestamp("syncStartedAt").notNull(),
  syncCompletedAt: timestamp("syncCompletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HealthSyncLog = typeof healthSyncLogs.$inferSelect;
export type InsertHealthSyncLog = typeof healthSyncLogs.$inferInsert;

/**
 * User preferences - stores user settings and API integration keys
 */
export const userPreferences = mysqlTable("userPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  healthKitEnabled: boolean("healthKitEnabled").default(false),
  autoSyncEnabled: boolean("autoSyncEnabled").default(true),
  syncIntervalMinutes: int("syncIntervalMinutes").default(15),
  healthKitAuthToken: text("healthKitAuthToken"), // Encrypted token for Apple Health API
  lastSyncAt: timestamp("lastSyncAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

/**
 * Relations for foreign keys
 */
export const usersRelations = relations(users, ({ many }) => ({
  healthMetrics: many(healthMetrics),
  expenses: many(expenses),
  healthSyncLogs: many(healthSyncLogs),
  preferences: many(userPreferences),
}));

export const healthMetricsRelations = relations(healthMetrics, ({ one }) => ({
  user: one(users, {
    fields: [healthMetrics.userId],
    references: [users.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
}));

export const healthSyncLogsRelations = relations(healthSyncLogs, ({ one }) => ({
  user: one(users, {
    fields: [healthSyncLogs.userId],
    references: [users.id],
  }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));
