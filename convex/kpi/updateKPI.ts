import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const updateEmployeeKPI = mutation({
  args: {
    kpiId: v.id("employeeKPIs"),
    actualValue: v.number(),
    calculatedScore: v.number(),
  },
  handler: async (ctx, { kpiId, actualValue, calculatedScore }) => {
    await ctx.db.patch(kpiId, {
      actualValue,
      calculatedScore,
    });
  },
});

export const createKPITemplate = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    targetValue: v.number(),
    weightage: v.number(),
    metricType: v.string(),
  },
  handler: async (ctx, args) => {
    const newTemplateId = await ctx.db.insert("kpiTemplates", args);
    return newTemplateId;
  },
});

export const updateKPITemplate = mutation({
  args: {
    kpiTemplateId: v.id("kpiTemplates"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    targetValue: v.optional(v.number()),
    weightage: v.optional(v.number()),
    metricType: v.optional(v.string()),
  },
  handler: async (ctx, { kpiTemplateId, ...rest }) => {
    await ctx.db.patch(kpiTemplateId, rest);
  },
});

export const deleteKPITemplate = mutation({
  args: {
    kpiTemplateId: v.id("kpiTemplates"),
  },
  handler: async (ctx, { kpiTemplateId }) => {
    await ctx.db.delete(kpiTemplateId);
  },
});
