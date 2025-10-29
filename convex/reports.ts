import { query } from "./_generated/server";
import { v } from "convex/values";

export const getAttendanceReport = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let attendance = await ctx.db.query("attendance").collect();
    
    // Filter by date range
    attendance = attendance.filter(a => {
      const attendanceDate = new Date(a.date);
      const start = new Date(args.startDate);
      const end = new Date(args.endDate);
      return attendanceDate >= start && attendanceDate <= end;
    });
    
    // Filter by user if specified
    if (args.userId) {
      attendance = attendance.filter(a => a.userId === args.userId);
    }
    
    const report = {
      totalDays: attendance.length,
      presentDays: attendance.filter(a => a.status === "present").length,
      lateDays: attendance.filter(a => a.status === "late").length,
      absentDays: attendance.filter(a => a.status === "absent").length,
      halfDays: attendance.filter(a => a.status === "half-day").length,
      averageHours: attendance.reduce((sum, a) => sum + (a.hoursWorked || 0), 0) / attendance.length || 0,
      attendanceRate: (attendance.filter(a => a.status !== "absent").length / attendance.length) * 100 || 0,
    };
    
    return { report, details: attendance };
  },
});

export const getLeaveReport = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let leaves = await ctx.db.query("leaves").collect();
    
    // Filter by date range
    leaves = leaves.filter(l => {
      const leaveDate = new Date(l.startDate);
      const start = new Date(args.startDate);
      const end = new Date(args.endDate);
      return leaveDate >= start && leaveDate <= end;
    });
    
    // Filter by user if specified
    if (args.userId) {
      leaves = leaves.filter(l => l.userId === args.userId);
    }
    
    const report = {
      totalRequests: leaves.length,
      approvedRequests: leaves.filter(l => l.status === "approved").length,
      pendingRequests: leaves.filter(l => l.status === "pending").length,
      rejectedRequests: leaves.filter(l => l.status === "rejected").length,
      leaveTypes: {
        sick: leaves.filter(l => l.type === "sick").length,
        vacation: leaves.filter(l => l.type === "vacation").length,
        personal: leaves.filter(l => l.type === "personal").length,
        maternity: leaves.filter(l => l.type === "maternity").length,
        paternity: leaves.filter(l => l.type === "paternity").length,
      },
      approvalRate: (leaves.filter(l => l.status === "approved").length / leaves.length) * 100 || 0,
    };
    
    return { report, details: leaves };
  },
});

export const getPayrollReport = query({
  args: {
    year: v.number(),
    month: v.optional(v.string()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let payroll = await ctx.db.query("payroll").collect();
    
    // Filter by year
    payroll = payroll.filter(p => p.year === args.year);
    
    // Filter by month if specified
    if (args.month) {
      payroll = payroll.filter(p => p.month === args.month);
    }
    
    // Filter by user if specified
    if (args.userId) {
      payroll = payroll.filter(p => p.userId === args.userId);
    }
    
    const report = {
      totalRecords: payroll.length,
      totalBaseSalary: payroll.reduce((sum, p) => sum + p.baseSalary, 0),
      totalAllowances: payroll.reduce((sum, p) => sum + p.allowances, 0),
      totalDeductions: payroll.reduce((sum, p) => sum + p.deductions, 0),
      totalNetSalary: payroll.reduce((sum, p) => sum + p.netSalary, 0),
      averageSalary: payroll.reduce((sum, p) => sum + p.netSalary, 0) / payroll.length || 0,
      statusBreakdown: {
        pending: payroll.filter(p => p.status === "pending").length,
        processed: payroll.filter(p => p.status === "processed").length,
        paid: payroll.filter(p => p.status === "paid").length,
      },
    };
    
    return { report, details: payroll };
  },
});

export const getPerformanceReport = query({
  args: {
    period: v.optional(v.string()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let performance = await ctx.db.query("performance").collect();
    
    // Filter by period if specified
    if (args.period) {
      performance = performance.filter(p => p.period === args.period);
    }
    
    // Filter by user if specified
    if (args.userId) {
      performance = performance.filter(p => p.userId === args.userId);
    }
    
    const report = {
      totalReviews: performance.length,
      averageScore: performance.reduce((sum, p) => sum + p.score, 0) / performance.length || 0,
      highPerformers: performance.filter(p => p.score >= 4.5).length,
      lowPerformers: performance.filter(p => p.score < 3.0).length,
      scoreDistribution: {
        excellent: performance.filter(p => p.score >= 4.5).length,
        good: performance.filter(p => p.score >= 3.5 && p.score < 4.5).length,
        average: performance.filter(p => p.score >= 2.5 && p.score < 3.5).length,
        poor: performance.filter(p => p.score < 2.5).length,
      },
      improvementTrend: performance.length > 1 ? 
        (performance[0].score - performance[performance.length - 1].score) : 0,
    };
    
    return { report, details: performance };
  },
});

export const getDashboardAnalytics = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const attendance = await ctx.db.query("attendance").collect();
    const leaves = await ctx.db.query("leaves").collect();
    const candidates = await ctx.db.query("candidates").collect();
    const interviews = await ctx.db.query("interviews").collect();
    
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.filter(a => a.date === today);
    
    return {
      totalEmployees: users.filter(u => u.role === "employee").length,
      activeEmployees: users.filter(u => u.isActive && u.role === "employee").length,
      presentToday: todayAttendance.filter(a => a.status === "present").length,
      pendingLeaves: leaves.filter(l => l.status === "pending").length,
      totalCandidates: candidates.length,
      scheduledInterviews: interviews.filter(i => i.status === "scheduled").length,
      attendanceRate: (todayAttendance.filter(a => a.status !== "absent").length / todayAttendance.length) * 100 || 0,
      leaveApprovalRate: (leaves.filter(l => l.status === "approved").length / leaves.length) * 100 || 0,
    };
  },
});