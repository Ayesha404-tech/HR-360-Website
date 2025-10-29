import { query } from "../_generated/server";
import { v } from "convex/values";

export const getEmployeeKPIs = query({
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

    const kpiTemplates = await Promise.all(
      employeeKPIs.map((kpi) => ctx.db.get(kpi.kpiTemplateId))
    );

    return employeeKPIs.map((kpi) => ({
      ...kpi,
      kpiTemplate: kpiTemplates.find((template) => template?._id === kpi.kpiTemplateId),
    }));
  },
});

export const getKPITemplates = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("kpiTemplates").collect();
  },
});
