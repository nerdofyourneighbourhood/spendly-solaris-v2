import { eq, desc, and, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, healthMetrics, InsertHealthMetric, expenses, InsertExpense, userPreferences, InsertUserPreference, healthSyncLogs, InsertHealthSyncLog } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Health Metrics Queries
 */
export async function addHealthMetric(metric: InsertHealthMetric) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(healthMetrics).values(metric);
}

export async function getHealthMetrics(userId: number, metricType?: string, hours: number = 24) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  let query = db.select().from(healthMetrics)
    .where(and(
      eq(healthMetrics.userId, userId),
      gte(healthMetrics.recordedAt, cutoffTime)
    ));
  
  if (metricType) {
    query = db.select().from(healthMetrics)
      .where(and(
        eq(healthMetrics.userId, userId),
        eq(healthMetrics.metricType, metricType as any),
        gte(healthMetrics.recordedAt, cutoffTime)
      ));
  }
  
  return query.orderBy(desc(healthMetrics.recordedAt));
}

export async function getLatestHealthMetric(userId: number, metricType: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(healthMetrics)
    .where(and(
      eq(healthMetrics.userId, userId),
      eq(healthMetrics.metricType, metricType as any)
    ))
    .orderBy(desc(healthMetrics.recordedAt))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

/**
 * Expenses Queries
 */
export async function addExpense(expense: InsertExpense) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(expenses).values(expense);
}

export async function getExpenses(userId: number, days: number = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const cutoffTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return db.select().from(expenses)
    .where(and(
      eq(expenses.userId, userId),
      gte(expenses.transactionDate, cutoffTime)
    ))
    .orderBy(desc(expenses.transactionDate));
}

export async function getTotalExpenses(userId: number, days: number = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const cutoffTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const result = await db.select().from(expenses)
    .where(and(
      eq(expenses.userId, userId),
      gte(expenses.transactionDate, cutoffTime)
    ));
  
  return result.reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0);
}

/**
 * User Preferences Queries
 */
export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function upsertUserPreferences(userId: number, prefs: Partial<InsertUserPreference>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getUserPreferences(userId);
  
  if (existing) {
    return db.update(userPreferences)
      .set(prefs)
      .where(eq(userPreferences.userId, userId));
  } else {
    return db.insert(userPreferences).values({
      userId,
      ...prefs,
    } as InsertUserPreference);
  }
}

/**
 * Health Sync Logs Queries
 */
export async function createHealthSyncLog(log: InsertHealthSyncLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(healthSyncLogs).values(log);
}

export async function updateHealthSyncLog(logId: number, updates: Partial<InsertHealthSyncLog>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(healthSyncLogs)
    .set(updates)
    .where(eq(healthSyncLogs.id, logId));
}

export async function getLatestHealthSyncLog(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(healthSyncLogs)
    .where(eq(healthSyncLogs.userId, userId))
    .orderBy(desc(healthSyncLogs.createdAt))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}
