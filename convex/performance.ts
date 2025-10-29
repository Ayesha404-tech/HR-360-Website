import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getPerformanceByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("performance")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getAllPerformanceReviews = query({
  handler: async (ctx) => {
    return await ctx.db.query("performance").collect();
  },
});

export const createPerformanceReview = mutation({
  args: {
    userId: v.id("users"),
    reviewerId: v.id("users"),
    period: v.string(),
    score: v.number(),
    feedback: v.string(),
    goals: v.array(v.string()),
    achievements: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("performance", {
      userId: args.userId,
      reviewerId: args.reviewerId,
      period: args.period,
      score: args.score,
      feedback: args.feedback,
      goals: args.goals,
      achievements: args.achievements,
      createdAt: new Date().toISOString(),
    });
  },
});

export const updatePerformanceReview = mutation({
  args: {
    reviewId: v.id("performance"),
    score: v.optional(v.number()),
    feedback: v.optional(v.string()),
    goals: v.optional(v.array(v.string())),
    achievements: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { reviewId, ...updates } = args;
    return await ctx.db.patch(reviewId, updates);
  },
});

export const getPerformanceAnalytics = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    let reviews;
    if (args.userId) {
      reviews = await ctx.db
        .query("performance")
        .withIndex("by_user", (q) => q.eq("userId", args.userId!))
        .collect();
    } else {
      reviews = await ctx.db.query("performance").collect();
    }

    const analytics = {
      totalReviews: reviews.length,
      averageScore: reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length || 0,
      scoreDistribution: {
        excellent: reviews.filter(r => r.score >= 4.5).length,
        good: reviews.filter(r => r.score >= 3.5 && r.score < 4.5).length,
        average: reviews.filter(r => r.score >= 2.5 && r.score < 3.5).length,
        poor: reviews.filter(r => r.score < 2.5).length,
      },
      trends: reviews.map(r => ({
        period: r.period,
        score: r.score,
        createdAt: r.createdAt,
      })),
    };

    return analytics;
  },
});