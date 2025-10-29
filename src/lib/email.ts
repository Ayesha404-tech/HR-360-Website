import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export const sendEmail = async (emailData: EmailData) => {
  try {
    const msg = {
      to: emailData.to,
      from: emailData.from || 'noreply@hr360.com',
      subject: emailData.subject,
      html: emailData.html,
    };

    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
};

export const sendLeaveApprovalEmail = async (userEmail: string, userName: string, status: string) => {
  const subject = `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">HR360 - Leave Request Update</h2>
      <p>Dear ${userName},</p>
      <p>Your leave request has been <strong>${status}</strong>.</p>
      <p>Please check your HR360 dashboard for more details.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">This is an automated message from HR360 System.</p>
    </div>
  `;

  return await sendEmail({
    to: userEmail,
    subject,
    html,
  });
};

export const sendInterviewScheduleEmail = async (
  candidateEmail: string, 
  candidateName: string, 
  interviewDate: string,
  position: string
) => {
  const subject = `Interview Scheduled - ${position}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">HR360 - Interview Scheduled</h2>
      <p>Dear ${candidateName},</p>
      <p>Your interview for the position of <strong>${position}</strong> has been scheduled.</p>
      <p><strong>Date & Time:</strong> ${interviewDate}</p>
      <p>Please be prepared and join on time. Good luck!</p>
      <hr>
      <p style="color: #666; font-size: 12px;">This is an automated message from HR360 System.</p>
    </div>
  `;

  return await sendEmail({
    to: candidateEmail,
    subject,
    html,
  });
};

export const sendPayrollNotification = async (
  userEmail: string,
  userName: string,
  month: string,
  netSalary: number
) => {
  const subject = `Payroll Processed - ${month}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">HR360 - Payroll Notification</h2>
      <p>Dear ${userName},</p>
      <p>Your salary for <strong>${month}</strong> has been processed.</p>
      <p><strong>Net Salary:</strong> $${netSalary.toLocaleString()}</p>
      <p>Please check your HR360 dashboard to download your payslip.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">This is an automated message from HR360 System.</p>
    </div>
  `;

  return await sendEmail({
    to: userEmail,
    subject,
    html,
  });
};