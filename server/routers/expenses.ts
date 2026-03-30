import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { addExpense, getExpenses, getTotalExpenses } from "../db";

export const expensesRouter = router({
  // Add a new expense
  add: protectedProcedure
    .input(
      z.object({
        merchant: z.string().min(1),
        amount: z.number().positive(),
        category: z.enum([
          "food",
          "shopping",
          "transport",
          "entertainment",
          "bills",
          "health",
          "other",
        ]),
        description: z.string().optional(),
        transactionDate: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return addExpense({
        userId: ctx.user.id,
        merchant: input.merchant,
        amount: input.amount.toString(),
        category: input.category,
        description: input.description,
        transactionDate: input.transactionDate,
      });
    }),

  // Get expenses for the past N days
  list: protectedProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      return getExpenses(ctx.user.id, input.days);
    }),

  // Get total expenses for the past N days
  getTotal: protectedProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      return getTotalExpenses(ctx.user.id, input.days);
    }),

  // Get expense summary by category
  getSummaryByCategory: protectedProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      const expenses = await getExpenses(ctx.user.id, input.days);

      const summary: Record<string, number> = {};
      for (const expense of expenses) {
        const category = expense.category;
        summary[category] = (summary[category] || 0) + parseFloat(expense.amount.toString());
      }

      return summary;
    }),
});
