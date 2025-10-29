import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const sendLeaveNotification = mutation({
  args: {
    userEmail: v.string(),
    userName: v.string(),
    leaveType: v.string(),
    status: v.string(),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    // In production, integrate with SendGrid
    const emailData = {
      to: args.userEmail,
      subject: `Leave Request ${args.status.charAt(0).toUpperCase() + args.status.slice(1)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">HR360 - Leave Request Update</h2>
          <p>Dear ${args.userName},</p>
          <p>Your ${args.leaveType} leave request from ${args.startDate} to ${args.endDate} has been <strong>${args.status}</strong>.</p>
          <p>Please check your HR360 dashboard for more details.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">This is an automated message from HR360 System.</p>
        </div>
      `,
    };
    
    // Mock email sending - replace with actual SendGrid integration
    console.log("Email would be sent:", emailData);
    
    return { success: true, emailData };
  },
});

export const sendInterviewNotification = mutation({
  args: {
    candidateEmail: v.string(),
    candidateName: v.string(),
    position: v.string(),
    scheduledAt: v.string(),
    meetingLink: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const emailData = {
      to: args.candidateEmail,
      subject: `Interview Scheduled - ${args.position}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">HR360 - Interview Scheduled</h2>
          <p>Dear ${args.candidateName},</p>
          <p>Your interview for the position of <strong>${args.position}</strong> has been scheduled.</p>
          <p><strong>Date & Time:</strong> ${new Date(args.scheduledAt).toLocaleString()}</p>
          ${args.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${args.meetingLink}">${args.meetingLink}</a></p>` : ''}
          <p>Please be prepared and join on time. Good luck!</p>
          <hr>
          <p style="color: #666; font-size: 12px;">This is an automated message from HR360 System.</p>
        </div>
      `,
    };
    
    console.log("Interview email would be sent:", emailData);
    return { success: true, emailData };
  },
});

export const sendPayrollNotification = mutation({
  args: {
    userEmail: v.string(),
    userName: v.string(),
    month: v.string(),
    year: v.number(),
    netSalary: v.number(),
  },
  handler: async (ctx, args) => {
    const emailData = {
      to: args.userEmail,
      subject: `Payroll Processed - ${args.month} ${args.year}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">HR360 - Payroll Notification</h2>
          <p>Dear ${args.userName},</p>
          <p>Your salary for <strong>${args.month} ${args.year}</strong> has been processed.</p>
          <p><strong>Net Salary:</strong> $${args.netSalary.toLocaleString()}</p>
          <p>Please check your HR360 dashboard to download your payslip.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">This is an automated message from HR360 System.</p>
        </div>
      `,
    };
    
    console.log("Payroll email would be sent:", emailData);
    return { success: true, emailData };
  },
});

export const sendWelcomeEmail = mutation({
  args: {
    userEmail: v.string(),
    userName: v.string(),
    role: v.string(),
    temporaryPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const emailData = {
      to: args.userEmail,
      subject: "Welcome to HR360 - Account Created",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">Welcome to HR360!</h2>
          <p>Dear ${args.userName},</p>
          <p>Your HR360 account has been created successfully.</p>
          <p><strong>Role:</strong> ${args.role.charAt(0).toUpperCase() + args.role.slice(1)}</p>
          <p><strong>Email:</strong> ${args.userEmail}</p>
          <p><strong>Temporary Password:</strong> ${args.temporaryPassword}</p>
          <p>Please login and change your password immediately.</p>
          <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to HR360</a></p>
          <hr>
          <p style="color: #666; font-size: 12px;">This is an automated message from HR360 System.</p>
        </div>
      `,
    };
    
    console.log("Welcome email would be sent:", emailData);
    return { success: true, emailData };
  },
});