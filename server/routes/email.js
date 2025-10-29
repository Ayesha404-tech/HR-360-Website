const express = require('express');
const nodemailer = require('nodemailer');
const { getPool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create email transporter (configure with your email service)
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send leave notification
router.post('/leave-notification', authenticateToken, async (req, res) => {
  try {
    const { userEmail, userName, leaveType, status, startDate, endDate } = req.body;

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      html: `
        <h2>Leave Request Update</h2>
        <p>Dear ${userName},</p>
        <p>Your ${leaveType} leave request has been ${status}.</p>
        <p><strong>Leave Details:</strong></p>
        <ul>
          <li>Type: ${leaveType}</li>
          <li>Start Date: ${startDate}</li>
          <li>End Date: ${endDate}</li>
          <li>Status: ${status.charAt(0).toUpperCase() + status.slice(1)}</li>
        </ul>
        <p>Best regards,<br>HR Team</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Leave notification sent successfully'
    });
  } catch (error) {
    console.error('Send leave notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send leave notification'
    });
  }
});

// Send interview notification
router.post('/interview-notification', authenticateToken, async (req, res) => {
  try {
    const { candidateEmail, candidateName, position, scheduledAt, meetingLink } = req.body;

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: candidateEmail,
      subject: `Interview Scheduled for ${position} Position`,
      html: `
        <h2>Interview Invitation</h2>
        <p>Dear ${candidateName},</p>
        <p>Congratulations! You have been selected for an interview for the ${position} position.</p>
        <p><strong>Interview Details:</strong></p>
        <ul>
          <li>Position: ${position}</li>
          <li>Date & Time: ${new Date(scheduledAt).toLocaleString()}</li>
          ${meetingLink ? `<li>Meeting Link: <a href="${meetingLink}">${meetingLink}</a></li>` : ''}
        </ul>
        <p>Please prepare for the interview and join on time.</p>
        <p>Best regards,<br>HR Team</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Interview notification sent successfully'
    });
  } catch (error) {
    console.error('Send interview notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send interview notification'
    });
  }
});

// Send payroll notification
router.post('/payroll-notification', authenticateToken, async (req, res) => {
  try {
    const { userEmail, userName, month, year, netSalary } = req.body;

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Payroll Processed for ${month} ${year}`,
      html: `
        <h2>Payroll Notification</h2>
        <p>Dear ${userName},</p>
        <p>Your payroll has been processed for ${month} ${year}.</p>
        <p><strong>Payroll Details:</strong></p>
        <ul>
          <li>Period: ${month} ${year}</li>
          <li>Net Salary: $${netSalary.toLocaleString()}</li>
        </ul>
        <p>Your payslip is available in the HR portal.</p>
        <p>Best regards,<br>Payroll Team</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Payroll notification sent successfully'
    });
  } catch (error) {
    console.error('Send payroll notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send payroll notification'
    });
  }
});

// Send welcome email
router.post('/welcome-email', authenticateToken, async (req, res) => {
  try {
    const { userEmail, userName, role, temporaryPassword } = req.body;

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Welcome to HR360 - Your Account Details',
      html: `
        <h2>Welcome to HR360!</h2>
        <p>Dear ${userName},</p>
        <p>Welcome to the HR360 Human Resources Management System. Your account has been created successfully.</p>
        <p><strong>Account Details:</strong></p>
        <ul>
          <li>Email: ${userEmail}</li>
          <li>Role: ${role.charAt(0).toUpperCase() + role.slice(1)}</li>
          <li>Temporary Password: ${temporaryPassword}</li>
        </ul>
        <p><strong>Important:</strong> Please change your password after first login for security purposes.</p>
        <p>You can access the system at: <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}">${process.env.FRONTEND_URL || 'http://localhost:5173'}</a></p>
        <p>Best regards,<br>HR Team</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Welcome email sent successfully'
    });
  } catch (error) {
    console.error('Send welcome email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send welcome email'
    });
  }
});

module.exports = router;
