import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "../_generated/dataModel";

export const calculateEmployeeKPI = mutation({
  args: {
    employeeId: v.id("users"),
    kpiTemplateId: v.id("kpiTemplates"),
    actualValue: v.number(),
    month: v.number(),
    year: v.number(),
  },
  handler: async (ctx, { employeeId, kpiTemplateId, actualValue, month, year }) => {
    const kpiTemplate = await ctx.db.get(kpiTemplateId);

    if (!kpiTemplate) {
      throw new Error("KPI Template not found");
    }

    const calculatedScore = (actualValue / kpiTemplate.targetValue) * kpiTemplate.weightage;

    const existingKPI = await ctx.db
      .query("employeeKPIs")
      .withIndex("by_employee_kpi_month_year", (q) =>
        q
          .eq("employeeId", employeeId)
          .eq("kpiTemplateId", kpiTemplateId)
          .eq("month", month)
          .eq("year", year)
      )
      .first();

    if (existingKPI) {
      await ctx.db.patch(existingKPI._id, {
        actualValue,
        calculatedScore,
      });
      return existingKPI._id;
    } else {
      const newKPIId = await ctx.db.insert("employeeKPIs", {
        employeeId,
        kpiTemplateId,
        actualValue,
        calculatedScore,
        month,
        year,
      });
      return newKPIId;
    }
  },
});

export const getOverallEmployeeKPIScore = query({
  args: {
    employeeId: v.id("users"),
    month: v.optional(v.number()),
    year: v.optional(v.number()),
  },
  handler: async (ctx, { employeeId, month, year }) => {
    let employeeKPIsQuery = ctx.db
      .query("employeeKPIs")
      .withIndex("by_employee_kpi_month_year", (q) => q.eq("employeeId", employeeId));

    if (month !== undefined && year !== undefined) {
      employeeKPIsQuery = employeeKPIsQuery.filter((q) =>
        q.and(q.eq(q.field("month"), month), q.eq(q.field("year"), year))
      );
    } else if (year !== undefined) {
      employeeKPIsQuery = employeeKPIsQuery.filter((q) => q.eq(q.field("year"), year));
    }

    const employeeKPIs = await employeeKPIsQuery.collect();

    const totalScore = employeeKPIs.reduce((sum, kpi) => sum + kpi.calculatedScore, 0);

    return {
      totalScore,
      kpis: employeeKPIs,
    };
  },
});

// Function to collect data from other modules (Attendance, Payroll, Performance Review)
export const collectModuleDataForKPI = mutation({
  args: {
    employeeId: v.id("users"),
    month: v.number(),
    year: v.number(),
  },
  handler: async (ctx, { employeeId, month, year }) => {
    const attendanceRecords = await ctx.db
      .query("attendance")
      .withIndex("by_user_date", (q) => q.eq("userId", employeeId))
      .filter((q) => q.eq(q.field("date"), `${year}-${String(month).padStart(2, '0')}-XX`)) // Assuming date is stored as YYYY-MM-DD
      .collect();

    const payrollRecords = await ctx.db
      .query("payroll")
      .withIndex("by_user_period", (q) =>
        q.eq("userId", employeeId).eq("year", year).eq("month", String(month))
      )
      .collect();

    const performanceReviews = await ctx.db
      .query("performance")
      .withIndex("by_user", (q) => q.eq("userId", employeeId))
      .filter((q) => q.eq(q.field("createdAt"), `${year}-${String(month).padStart(2, '0')}-XX`)) // Assuming createdAt is stored as YYYY-MM-DD
      .collect();

    // Here you would process this data and potentially update employeeKPIs
    // For example, you could have a KPI template for "Attendance Rate"
    // and use the attendanceRecords to calculate the actualValue for that KPI.

    return {  
      attendanceRecords,
      payrollRecords,
      performanceReviews,
    };
  },
});
