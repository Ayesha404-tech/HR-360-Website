import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    role: v.union(v.literal("admin"), v.literal("hr"), v.literal("employee"), v.literal("candidate")),
    department: v.optional(v.string()),
    position: v.optional(v.string()),
    joinDate: v.optional(v.string()),
    salary: v.optional(v.number()),
    isActive: v.boolean(),
    passwordHash: v.string(),
    avatar: v.optional(v.string()),
    phone: v.optional(v.string()),
  }).index("by_email", ["email"]),

  attendance: defineTable({
    userId: v.id("users"),
    date: v.string(),
    clockIn: v.string(),
    clockOut: v.optional(v.string()),
    hoursWorked: v.optional(v.number()),
    status: v.union(v.literal("present"), v.literal("absent"), v.literal("late"), v.literal("half-day")),
  }).index("by_user_date", ["userId", "date"]),

  leaves: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("sick"), v.literal("vacation"), v.literal("personal"), v.literal("maternity"), v.literal("paternity")),
    startDate: v.string(),
    endDate: v.string(),
    reason: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    approvedBy: v.optional(v.id("users")),
    appliedAt: v.string(),
  }).index("by_user", ["userId"]).index("by_status", ["status"]),

  payroll: defineTable({
    userId: v.id("users"),
    month: v.string(),
    year: v.number(),
    baseSalary: v.number(),
    allowances: v.number(),
    deductions: v.number(),
    netSalary: v.number(),
    status: v.union(v.literal("pending"), v.literal("processed"), v.literal("paid")),
  }).index("by_user_period", ["userId", "year", "month"]),

  performance: defineTable({
    userId: v.id("users"),
    reviewerId: v.id("users"),
    period: v.string(),
    score: v.number(),
    feedback: v.string(),
    goals: v.array(v.string()),
    achievements: v.array(v.string()),
    createdAt: v.string(),
  }).index("by_user", ["userId"]),

  kpiTemplates: defineTable({
    title: v.string(),
    description: v.string(),
    targetValue: v.number(),
    weightage: v.number(),
    metricType: v.string(), // e.g., "percentage", "count", "currency"
  }),

  employeeKPIs: defineTable({
    employeeId: v.id("users"),
    kpiTemplateId: v.id("kpiTemplates"),
    actualValue: v.number(),
    calculatedScore: v.number(),
    month: v.number(), // 1-12
    year: v.number(),
  }).index("by_employee_kpi_month_year", ["employeeId", "kpiTemplateId", "month", "year"]),

  interviews: defineTable({
    candidateId: v.id("candidates"),
    interviewerId: v.id("users"),
    position: v.string(),
    scheduledAt: v.string(),
    status: v.union(v.literal("scheduled"), v.literal("completed"), v.literal("cancelled")),
    feedback: v.optional(v.string()),
    rating: v.optional(v.number()),
    meetingLink: v.optional(v.string()),
  }).index("by_candidate", ["candidateId"]).index("by_interviewer", ["interviewerId"]),

  candidates: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    position: v.string(),
    resumeUrl: v.optional(v.string()),
    status: v.union(v.literal("applied"), v.literal("screening"), v.literal("interview"), v.literal("offered"), v.literal("hired"), v.literal("rejected")),
    appliedAt: v.string(),
    aiScore: v.optional(v.number()),
    skills: v.optional(v.array(v.string())),
    experience: v.optional(v.string()),
    education: v.optional(v.string()),
    strengths: v.optional(v.array(v.string())),
    weaknesses: v.optional(v.array(v.string())),
    recommendation: v.optional(v.string()),
    summary: v.optional(v.string()),
  }).index("by_email", ["email"]).index("by_status", ["status"]),

  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(v.literal("info"), v.literal("success"), v.literal("warning"), v.literal("error")),
    isRead: v.boolean(),
    createdAt: v.string(),
  }).index("by_user", ["userId"]),

  chatMessages: defineTable({
    userId: v.id("users"),
    message: v.string(),
    response: v.string(),
    timestamp: v.string(),
  }).index("by_user", ["userId"]),

  exitRequests: defineTable({
    userId: v.id("users"),
    resignationDate: v.string(),
    lastWorkingDay: v.string(),
    reason: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("completed")),
    clearanceStatus: v.object({
      it: v.boolean(),
      hr: v.boolean(),
      finance: v.boolean(),
      admin: v.boolean(),
    }),
    appliedAt: v.string(),
  }).index("by_user", ["userId"]),

  emailConfigs: defineTable({
    user: v.string(),
    password: v.string(),
    host: v.string(),
    port: v.number(),
    tls: v.boolean(),
    enabled: v.boolean(),
    monitoringInterval: v.number(),
    lastChecked: v.optional(v.string()),
    isActive: v.boolean(),
  }),

  processedEmails: defineTable({
    messageId: v.string(),
    subject: v.string(),
    from: v.string(),
    processedAt: v.string(),
    attachmentsProcessed: v.number(),
    candidatesCreated: v.number(),
    status: v.union(v.literal("success"), v.literal("partial"), v.literal("failed")),
    error: v.optional(v.string()),
  }).index("by_message_id", ["messageId"]),
});
