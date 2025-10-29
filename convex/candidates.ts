import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAllCandidates = query({
  handler: async (ctx) => {
    return await ctx.db.query("candidates").collect();
  },
});

export const getCandidateById = query({
  args: { candidateId: v.id("candidates") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.candidateId);
  },
});

export const getCandidatesByStatus = query({
  args: { status: v.union(v.literal("applied"), v.literal("screening"), v.literal("interview"), v.literal("offered"), v.literal("hired"), v.literal("rejected")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("candidates")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const createCandidate = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    position: v.string(),
    resumeUrl: v.optional(v.string()),
    experience: v.optional(v.string()),
    education: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    coverLetter: v.optional(v.string()),
    aiScore: v.optional(v.number()),
    strengths: v.optional(v.array(v.string())),
    weaknesses: v.optional(v.array(v.string())),
    recommendation: v.optional(v.string()),
    summary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("candidates", {
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phone: args.phone,
      position: args.position,
      resumeUrl: args.resumeUrl,
      experience: args.experience,
      education: args.education,
      skills: args.skills,
      coverLetter: args.coverLetter,
      aiScore: args.aiScore,
      strengths: args.strengths,
      weaknesses: args.weaknesses,
      recommendation: args.recommendation,
      summary: args.summary,
      status: "screening",
      appliedAt: new Date().toISOString(),
    });
  },
});

export const updateCandidateStatus = mutation({
  args: {
    candidateId: v.id("candidates"),
    status: v.union(v.literal("applied"), v.literal("screening"), v.literal("interview"), v.literal("offered"), v.literal("hired"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.candidateId, {
      status: args.status,
    });
  },
});

export const updateCandidateAIScore = mutation({
  args: {
    candidateId: v.id("candidates"),
    aiScore: v.number(),
    skills: v.optional(v.array(v.string())),
    experience: v.optional(v.string()),
    education: v.optional(v.string()),
    strengths: v.optional(v.array(v.string())),
    weaknesses: v.optional(v.array(v.string())),
    recommendation: v.optional(v.string()),
    summary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { candidateId, ...updates } = args;
    return await ctx.db.patch(candidateId, {
      ...updates,
      status: "screening"
    });
  },
});

export const searchCandidates = query({
  args: {
    searchTerm: v.string(),
    position: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let candidates = await ctx.db.query("candidates").collect();
    
    // Filter by search term
    if (args.searchTerm) {
      const term = args.searchTerm.toLowerCase();
      candidates = candidates.filter(c => 
        c.firstName.toLowerCase().includes(term) ||
        c.lastName.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.position.toLowerCase().includes(term)
      );
    }
    
    // Filter by position
    if (args.position) {
      candidates = candidates.filter(c => c.position === args.position);
    }
    
    // Filter by status
    if (args.status) {
      candidates = candidates.filter(c => c.status === args.status);
    }
    
    return candidates;
  },
});