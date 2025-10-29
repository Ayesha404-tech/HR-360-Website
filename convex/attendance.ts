import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAttendanceByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("attendance")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const clockIn = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const clockInTime = now.toTimeString().slice(0, 5);
    
    // Check if already clocked in today
    const existingRecord = await ctx.db
      .query("attendance")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId).eq("date", today))
      .first();

    if (existingRecord) {
      throw new Error("Already clocked in today");
    }

    const status = now.getHours() > 9 ? "late" : "present";

    return await ctx.db.insert("attendance", {
      userId: args.userId,
      date: today,
      clockIn: clockInTime,
      status,
    });
  },
});

export const clockOut = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const clockOutTime = now.toTimeString().slice(0, 5);

    const record = await ctx.db
      .query("attendance")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId).eq("date", today))
      .first();

    if (!record) {
      throw new Error("No clock-in record found for today");
    }

    if (record.clockOut) {
      throw new Error("Already clocked out today");
    }

    const clockInTime = new Date(`${today}T${record.clockIn}`);
    const clockOutTimeDate = new Date(`${today}T${clockOutTime}`);
    const hoursWorked = (clockOutTimeDate.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

    return await ctx.db.patch(record._id, {
      clockOut: clockOutTime,
      hoursWorked,
    });
  },
});

export const getAllAttendance = query({
  handler: async (ctx) => {
    return await ctx.db.query("attendance").collect();
  },
});