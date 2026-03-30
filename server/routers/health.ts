import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  addHealthMetric,
  getHealthMetrics,
  getLatestHealthMetric,
  createHealthSyncLog,
  getLatestHealthSyncLog,
  updateHealthSyncLog,
  getUserPreferences,
  upsertUserPreferences,
} from "../db";

export const healthRouter = router({
  // Add a new health metric
  addMetric: protectedProcedure
    .input(
      z.object({
        metricType: z.enum([
          "steps",
          "heartRate",
          "calories",
          "distance",
          "activeMinutes",
          "sleepDuration",
          "bloodPressure",
          "bloodOxygen",
        ]),
        value: z.number(),
        unit: z.string(),
        recordedAt: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return addHealthMetric({
        userId: ctx.user.id,
        metricType: input.metricType,
        value: input.value.toString(),
        unit: input.unit,
        recordedAt: input.recordedAt,
      });
    }),

  // Get health metrics for the past N hours
  getMetrics: protectedProcedure
    .input(
      z.object({
        metricType: z.string().optional(),
        hours: z.number().default(24),
      })
    )
    .query(async ({ ctx, input }) => {
      return getHealthMetrics(ctx.user.id, input.metricType, input.hours);
    }),

  // Get latest value for a specific metric type
  getLatestMetric: protectedProcedure
    .input(z.object({ metricType: z.string() }))
    .query(async ({ ctx, input }) => {
      return getLatestHealthMetric(ctx.user.id, input.metricType);
    }),

  // Get user health preferences
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    return getUserPreferences(ctx.user.id);
  }),

  // Update user health preferences
  updatePreferences: protectedProcedure
    .input(
      z.object({
        healthKitEnabled: z.boolean().optional(),
        autoSyncEnabled: z.boolean().optional(),
        syncIntervalMinutes: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return upsertUserPreferences(ctx.user.id, input);
    }),

  // Sync health data from Apple Health (simulated)
  syncHealthData: protectedProcedure
    .input(
      z.object({
        metrics: z.array(
          z.object({
            metricType: z.string(),
            value: z.number(),
            unit: z.string(),
            recordedAt: z.date(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Add all metrics
        for (const metric of input.metrics) {
          await addHealthMetric({
            userId: ctx.user.id,
            metricType: metric.metricType as any,
            value: metric.value.toString(),
            unit: metric.unit,
            recordedAt: metric.recordedAt,
          });
        }

        // Create successful sync log
        await createHealthSyncLog({
          userId: ctx.user.id,
          syncStatus: "success",
          metricsCount: input.metrics.length,
          syncStartedAt: new Date(),
          syncCompletedAt: new Date(),
        });

        return { success: true, metricsAdded: input.metrics.length };
      } catch (error) {
        // Create failed sync log
        await createHealthSyncLog({
          userId: ctx.user.id,
          syncStatus: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
          syncStartedAt: new Date(),
          syncCompletedAt: new Date(),
        });

        throw error;
      }
    }),

  // Get latest sync status
  getLastSyncStatus: protectedProcedure.query(async ({ ctx }) => {
    return getLatestHealthSyncLog(ctx.user.id);
  }),
});
