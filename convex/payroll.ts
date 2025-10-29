import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getPayrollByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payroll")
      .withIndex("by_user_period", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getAllPayroll = query({
  handler: async (ctx) => {
    return await ctx.db.query("payroll").collect();
  },
});

export const processPayroll = mutation({
  args: {
    userId: v.id("users"),
    month: v.string(),
    year: v.number(),
    baseSalary: v.number(),
    allowances: v.optional(v.number()),
    deductions: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allowances = args.allowances || 0;
    const deductions = args.deductions || 0;
    const netSalary = args.baseSalary + allowances - deductions;

    return await ctx.db.insert("payroll", {
      userId: args.userId,
      month: args.month,
      year: args.year,
      baseSalary: args.baseSalary,
      allowances,
      deductions,
      netSalary,
      status: "processed",
    });
  },
});

export const generatePayslip = mutation({
  args: { payrollId: v.id("payroll") },
  handler: async (ctx, args) => {
    const payroll = await ctx.db.get(args.payrollId);
    if (!payroll) throw new Error("Payroll record not found");

    // Generate payslip data
    return {
      payrollId: args.payrollId,
      generatedAt: new Date().toISOString(),
      downloadUrl: `/payslips/${args.payrollId}.pdf`,
    };
  },
});

export const updatePayrollStatus = mutation({
  args: {
    payrollId: v.id("payroll"),
    status: v.union(v.literal("pending"), v.literal("processed"), v.literal("paid")),
  },
  handler: async (ctx, args) => {
    // Update payroll status
    await ctx.db.patch(args.payrollId, {
      status: args.status,
    });

    // Get payroll details for notification
    const payroll = await ctx.db.get(args.payrollId);
    if (!payroll) return;

    const user = await ctx.db.get(payroll.userId);
    if (!user) return;

    // Create notification for the user
    let title = "";
    let message = "";
    let type: "info" | "success" | "warning" | "error" = "info";

    if (args.status === "processed") {
      title = "Payroll Processed";
      message = `Your ${payroll.month} ${payroll.year} salary of $${payroll.netSalary} has been processed.`;
      type = "success";
    } else if (args.status === "paid") {
      title = "Salary Credited";
      message = `Your ${payroll.month} ${payroll.year} salary of $${payroll.netSalary} has been credited to your account.`;
      type = "success";
    }

    if (title && message) {
      await ctx.db.insert("notifications", {
        userId: payroll.userId,
        title,
        message,
        type,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    return { payrollId: args.payrollId, status: args.status };
  },
});
