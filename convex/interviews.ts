import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getInterviewsByCandidate = query({
  args: { candidateId: v.id("candidates") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("interviews")
      .withIndex("by_candidate", (q) => q.eq("candidateId", args.candidateId))
      .collect();
  },
});

export const getInterviewsByInterviewer = query({
  args: { interviewerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("interviews")
      .withIndex("by_interviewer", (q) => q.eq("interviewerId", args.interviewerId))
      .collect();
  },
});

export const getAllInterviews = query({
  handler: async (ctx) => {
    return await ctx.db.query("interviews").collect();
  },
});

export const scheduleInterview = mutation({
  args: {
    candidateId: v.id("candidates"),
    interviewerId: v.id("users"),
    position: v.string(),
    scheduledAt: v.string(),
    meetingLink: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Schedule the interview
    const interviewId = await ctx.db.insert("interviews", {
      candidateId: args.candidateId,
      interviewerId: args.interviewerId,
      position: args.position,
      scheduledAt: args.scheduledAt,
      status: "scheduled",
      meetingLink: args.meetingLink,
    });

    // Get candidate details for notification
    const candidate = await ctx.db.get(args.candidateId);
    if (!candidate) return interviewId;

    // Create notification for the candidate
    await ctx.db.insert("notifications", {
      userId: args.interviewerId, // Notify the interviewer
      title: "Interview Scheduled",
      message: `Interview scheduled with ${candidate.firstName} ${candidate.lastName} for ${args.position} position on ${new Date(args.scheduledAt).toLocaleString()}.`,
      type: "info",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return interviewId;
  },
});

export const updateInterviewStatus = mutation({
  args: {
    interviewId: v.id("interviews"),
    status: v.union(v.literal("scheduled"), v.literal("completed"), v.literal("cancelled")),
    feedback: v.optional(v.string()),
    rating: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { interviewId, ...updates } = args;
    return await ctx.db.patch(interviewId, updates);
  },
});

export const getInterviewCalendar = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
    interviewerId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let interviews = await ctx.db.query("interviews").collect();
    
    if (args.interviewerId) {
      interviews = interviews.filter(i => i.interviewerId === args.interviewerId);
    }
    
    // Filter by date range
    interviews = interviews.filter(i => {
      const interviewDate = new Date(i.scheduledAt);
      const start = new Date(args.startDate);
      const end = new Date(args.endDate);
      return interviewDate >= start && interviewDate <= end;
    });
    
    return interviews;
  },
});

export const rescheduleInterview = mutation({
  args: {
    interviewId: v.id("interviews"),
    newScheduledAt: v.string(),
    meetingLink: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.interviewId, {
      scheduledAt: args.newScheduledAt,
      meetingLink: args.meetingLink,
      status: "scheduled",
    });
  },
});