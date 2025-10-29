import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", args.email)).first();
  },
});

export const get = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    role: v.union(v.literal("admin"), v.literal("hr"), v.literal("employee"), v.literal("candidate")),
    department: v.optional(v.string()),
    position: v.optional(v.string()),
    salary: v.optional(v.number()),
    joinDate: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", args);
  },
});

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("hr"), v.literal("employee"), v.literal("candidate"))),
    department: v.optional(v.string()),
    position: v.optional(v.string()),
    salary: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    return await ctx.db.patch(userId, updates);
  },
});

export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.userId);
  },
});
