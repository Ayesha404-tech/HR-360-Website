interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

class EmailService {
  private apiKey: string;
  private baseUrl = 'https://api.sendgrid.com/v3/mail/send';

  constructor() {
    this.apiKey = import.meta.env.VITE_SENDGRID_API_KEY || '';
  }

  async sendEmail(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
    if (!this.apiKey) {
      console.warn('SendGrid API key not configured');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: emailData.to }],
            subject: emailData.subject,
          }],
          from: { email: emailData.from || 'noreply@hr360.com' },
          content: [{
            type: 'text/html',
            value: emailData.html,
          }],
        }),
      });

      if (response.ok) {
        return { success: true };
      } else {
        const error = await response.text();
        return { success: false, error };
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async sendLeaveApprovalEmail(userEmail: string, userName: string, status: string, leaveDetails: Record<string, unknown>) {
    const subject = `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #3B82F6; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">HR360 - Leave Request Update</h2>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <p>Dear ${userName},</p>
          <p>Your leave request has been <strong style="color: ${status === 'approved' ? '#10B981' : '#EF4444'}">${status.toUpperCase()}</strong>.</p>

          <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <h4 style="margin-top: 0;">Leave Details:</h4>
            <p><strong>Type:</strong> ${leaveDetails.type}</p>
            <p><strong>Duration:</strong> ${leaveDetails.startDate} to ${leaveDetails.endDate}</p>
            <p><strong>Reason:</strong> ${leaveDetails.reason}</p>
          </div>

          <p>Please check your HR360 dashboard for more details.</p>

          <div style="text-align: center; margin: 20px 0;">
            <a href="https://hr360.com/dashboard" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Open HR360 Dashboard
            </a>
          </div>

          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            This is an automated message from HR360 System. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({ to: userEmail, subject, html });
  }

  async sendInterviewScheduleEmail(candidateEmail: string, candidateName: string, interviewDetails: Record<string, unknown>) {
    const subject = `Interview Scheduled - ${interviewDetails.position}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #10B981; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">HR360 - Interview Scheduled</h2>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <p>Dear ${candidateName},</p>
          <p>Your interview for the position of <strong>${interviewDetails.position}</strong> has been scheduled.</p>
          
          <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <h4 style="margin-top: 0;">Interview Details:</h4>
            <p><strong>Date & Time:</strong> ${new Date(interviewDetails.scheduledAt as string).toLocaleString()}</p>
            <p><strong>Position:</strong> ${interviewDetails.position}</p>
            ${interviewDetails.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${interviewDetails.meetingLink}">${interviewDetails.meetingLink}</a></p>` : ''}
            ${interviewDetails.location ? `<p><strong>Location:</strong> ${interviewDetails.location}</p>` : ''}
          </div>
          
          <p>Please be prepared and join on time. Good luck!</p>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <h4 style="margin-top: 0; color: #92400e;">Interview Tips:</h4>
            <ul style="color: #92400e; margin: 0;">
              <li>Review the job description thoroughly</li>
              <li>Prepare examples of your work experience</li>
              <li>Test your internet connection (for video interviews)</li>
              <li>Arrive 5-10 minutes early</li>
            </ul>
          </div>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            This is an automated message from HR360 System. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({ to: candidateEmail, subject, html });
  }

  async sendPayrollNotification(userEmail: string, userName: string, payrollDetails: Record<string, unknown>) {
    const subject = `Payroll Processed - ${payrollDetails.month} ${payrollDetails.year}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #8B5CF6; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">HR360 - Payroll Notification</h2>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <p>Dear ${userName},</p>
          <p>Your salary for <strong>${payrollDetails.month} ${payrollDetails.year}</strong> has been processed.</p>
          
          <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <h4 style="margin-top: 0;">Salary Breakdown:</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px 0;"><strong>Base Salary:</strong></td>
                <td style="text-align: right; padding: 8px 0;">$${(payrollDetails.baseSalary as number).toLocaleString()}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px 0; color: #10B981;"><strong>Allowances:</strong></td>
                <td style="text-align: right; padding: 8px 0; color: #10B981;">+$${(payrollDetails.allowances as number).toLocaleString()}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px 0; color: #EF4444;"><strong>Deductions:</strong></td>
                <td style="text-align: right; padding: 8px 0; color: #EF4444;">-$${(payrollDetails.deductions as number).toLocaleString()}</td>
              </tr>
              <tr style="border-top: 2px solid #3B82F6;">
                <td style="padding: 12px 0;"><strong>Net Salary:</strong></td>
                <td style="text-align: right; padding: 12px 0; font-size: 18px; color: #3B82F6;"><strong>$${(payrollDetails.netSalary as number).toLocaleString()}</strong></td>
              </tr>
            </table>
          </div>
          
          <p>Please check your HR360 dashboard to download your detailed payslip.</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="https://hr360.com/payroll" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Download Payslip
            </a>
          </div>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            This is an automated message from HR360 System. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({ to: userEmail, subject, html });
  }

  async sendWelcomeEmail(userEmail: string, userName: string, userDetails: Record<string, unknown>) {
    const subject = "Welcome to HR360 - Account Created";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to HR360!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your HR Management System</p>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
          <p>Dear ${userName},</p>
          <p>Your HR360 account has been created successfully. Welcome to our team!</p>
          
          <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #3B82F6;">Account Details:</h4>
            <p><strong>Name:</strong> ${userName}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Role:</strong> ${(userDetails.role as string).charAt(0).toUpperCase() + (userDetails.role as string).slice(1)}</p>
            <p><strong>Department:</strong> ${userDetails.department || 'Not specified'}</p>
            <p><strong>Position:</strong> ${userDetails.position || 'Not specified'}</p>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #92400e;">Getting Started:</h4>
            <ul style="color: #92400e; margin: 0;">
              <li>Login to your dashboard using your email and password</li>
              <li>Complete your profile information</li>
              <li>Explore the HR modules available to your role</li>
              <li>Contact HR if you need any assistance</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://hr360.com/login" style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Login to HR360
            </a>
          </div>
          
          <p>If you have any questions or need support, please don't hesitate to contact our HR team.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            This is an automated message from HR360 System. Please do not reply to this email.<br>
            For support, contact: support@hr360.com
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({ to: userEmail, subject, html });
  }
}

export const emailService = new EmailService();