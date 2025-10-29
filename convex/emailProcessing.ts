import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get HR users for notifications
export const getHRUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").filter(q => q.eq(q.field("role"), "hr")).collect();
  },
});

// Email configuration for automatic processing
export const getEmailConfig = query({
  handler: async (ctx) => {
    // In production, this should be stored securely
    // For now, return default config structure
    return {
      user: process.env.EMAIL_USER || "ayesha.14366.ac@iqra.edu.pk",
      password: process.env.EMAIL_PASSWORD || "345888.",
      host: process.env.EMAIL_HOST || "outlook.office365.com", // Outlook IMAP for iqra.edu.pk
      port: parseInt(process.env.EMAIL_PORT || "993"),
      tls: true,
      enabled: false,
      monitoringInterval: 5, // minutes
    };
  },
});

export const updateEmailConfig = mutation({
  args: {
    user: v.string(),
    password: v.string(),
    host: v.string(),
    port: v.number(),
    tls: v.boolean(),
    enabled: v.boolean(),
    monitoringInterval: v.number(),
  },
  handler: async (ctx, args) => {
    // In production, store this securely in environment variables or encrypted storage
    // For now, we'll just validate and return success
    console.log("Email config updated:", { ...args, password: "***" });
    return { success: true };
  },
});

// Batch processing mutations for candidates
export const processCandidateBatch = mutation({
  args: {
    candidates: v.array(v.object({
      firstName: v.string(),
      lastName: v.string(),
      email: v.string(),
      phone: v.string(),
      position: v.string(),
      resumeUrl: v.string(),
      aiScore: v.optional(v.number()),
      skills: v.optional(v.array(v.string())),
      experience: v.optional(v.string()),
      education: v.optional(v.string()),
      strengths: v.optional(v.array(v.string())),
      weaknesses: v.optional(v.array(v.string())),
      recommendation: v.optional(v.string()),
      summary: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const results = [];
    const errors = [];

    // Get HR user for notifications
    const hrUsers = await ctx.db.query("users").filter(q => q.eq(q.field("role"), "hr")).collect();
    const hrUserId = hrUsers.length > 0 ? hrUsers[0]._id : null;

    for (const candidateData of args.candidates) {
      try {
        // Check if candidate already exists
        const existingCandidate = await ctx.db
          .query("candidates")
          .withIndex("by_email", (q) => q.eq("email", candidateData.email))
          .first();

        // Remove status from candidateData to avoid conflicts
        const { status: _, ...updateData } = candidateData;

        if (existingCandidate) {
          // Update existing candidate
          await ctx.db.patch(existingCandidate._id, {
            ...updateData,
            status: "screening" as const,
            appliedAt: new Date().toISOString(),
          });
          results.push({ id: existingCandidate._id, action: "updated" });
        } else {
          // Create new candidate
          const candidateId = await ctx.db.insert("candidates", {
            ...updateData,
            status: "screening" as const,
            appliedAt: new Date().toISOString(),
          });
          results.push({ id: candidateId, action: "created" });
        }
      } catch (error) {
        console.error("Error processing candidate:", error);
        errors.push({
          email: candidateData.email,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Send notification to HR about batch processing
    if (results.length > 0 && hrUserId) {
      await ctx.db.insert("notifications", {
        userId: hrUserId,
        title: "Automatic CV Processing Complete",
        message: `Successfully processed ${results.length} CVs. ${errors.length > 0 ? `${errors.length} failed.` : ''}`,
        type: errors.length > 0 ? "warning" : "success",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    return {
      success: true,
      processed: results.length,
      errors: errors.length,
      results,
      errors,
    };
  },
});

// Processing status tracking
export const getProcessingStatus = query({
  handler: async (ctx) => {
    // Get recent processing activities
    const recentNotifications = await ctx.db
      .query("notifications")
      .filter((q) => q.eq(q.field("type"), "success") || q.eq(q.field("type"), "warning"))
      .order("desc")
      .take(10);

    const recentCandidates = await ctx.db
      .query("candidates")
      .withIndex("by_status", (q) => q.eq("status", "screening"))
      .order("desc")
      .take(20);

    return {
      recentProcessing: recentNotifications,
      recentCandidates,
      totalCandidates: recentCandidates.length,
    };
  },
});

// Manual trigger for email processing (for testing/admin purposes)
export const triggerEmailProcessing = mutation({
  handler: async (ctx) => {
    // This would trigger the email processing service
    // In a real implementation, this would call the email processing service
    console.log("Manual email processing triggered");

    // Get HR user for notifications
    const hrUsers = await ctx.db.query("users").filter(q => q.eq(q.field("role"), "hr")).collect();
    const hrUserId = hrUsers.length > 0 ? hrUsers[0]._id : null;

    if (hrUserId) {
      // Create a notification
      await ctx.db.insert("notifications", {
        userId: hrUserId,
        title: "Email Processing Triggered",
        message: "Manual email processing has been initiated.",
        type: "info",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    return { success: true, message: "Email processing triggered" };
  },
});

// Get processing statistics
export const getProcessingStats = query({
  handler: async (ctx) => {
    const totalCandidates = await ctx.db.query("candidates").collect();
    const screeningCandidates = totalCandidates.filter(c => c.status === "screening");
    const appliedCandidates = totalCandidates.filter(c => c.status === "applied");

    const recentProcessing = await ctx.db
      .query("notifications")
      .filter((q) =>
        q.eq(q.field("title"), "Automatic CV Processing Complete") ||
        q.eq(q.field("title"), "Email Processing Triggered")
      )
      .order("desc")
      .take(5);

    return {
      totalCandidates: totalCandidates.length,
      screeningCandidates: screeningCandidates.length,
      appliedCandidates: appliedCandidates.length,
      recentProcessing: recentProcessing.length,
      lastProcessingTime: recentProcessing[0]?.createdAt || null,
    };
  },
});
