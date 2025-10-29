-- HR360 Database Schema Migration
-- Run this script to create all necessary tables

CREATE DATABASE IF NOT EXISTS hr360_db;
USE hr360_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  role ENUM('admin', 'hr', 'employee', 'candidate') NOT NULL,
  department VARCHAR(100),
  position VARCHAR(100),
  joinDate DATE,
  salary DECIMAL(10,2),
  isActive BOOLEAN DEFAULT TRUE,
  passwordHash VARCHAR(255) NOT NULL,
  avatar VARCHAR(500),
  phone VARCHAR(20),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  date DATE NOT NULL,
  clockIn TIME,
  clockOut TIME,
  hoursWorked DECIMAL(5,2),
  status ENUM('present', 'absent', 'late', 'half-day') NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_date (userId, date),
  INDEX idx_user_date (userId, date)
);

-- Leaves table
CREATE TABLE IF NOT EXISTS leaves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  type ENUM('sick', 'vacation', 'personal', 'maternity', 'paternity') NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  approvedBy INT,
  appliedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approvedBy) REFERENCES users(id),
  INDEX idx_user (userId),
  INDEX idx_status (status)
);

-- Payroll table
CREATE TABLE IF NOT EXISTS payroll (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  month VARCHAR(20) NOT NULL,
  year INT NOT NULL,
  baseSalary DECIMAL(10,2) NOT NULL,
  allowances DECIMAL(10,2) DEFAULT 0,
  deductions DECIMAL(10,2) DEFAULT 0,
  netSalary DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'processed', 'paid') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_period (userId, year, month),
  INDEX idx_user_period (userId, year, month)
);

-- Performance table
CREATE TABLE IF NOT EXISTS performance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  reviewerId INT NOT NULL,
  period VARCHAR(50) NOT NULL,
  score DECIMAL(3,1) NOT NULL,
  feedback TEXT NOT NULL,
  goals JSON,
  achievements JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewerId) REFERENCES users(id),
  INDEX idx_user (userId)
);

-- KPI Templates table
CREATE TABLE IF NOT EXISTS kpiTemplates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  targetValue DECIMAL(10,2) NOT NULL,
  weightage DECIMAL(5,2) NOT NULL,
  metricType VARCHAR(50) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Employee KPIs table
CREATE TABLE IF NOT EXISTS employeeKPIs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employeeId INT NOT NULL,
  kpiTemplateId INT NOT NULL,
  actualValue DECIMAL(10,2) NOT NULL,
  calculatedScore DECIMAL(5,2) NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employeeId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (kpiTemplateId) REFERENCES kpiTemplates(id) ON DELETE CASCADE,
  UNIQUE KEY unique_employee_kpi_month_year (employeeId, kpiTemplateId, month, year),
  INDEX idx_employee_kpi_month_year (employeeId, kpiTemplateId, month, year)
);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  position VARCHAR(100) NOT NULL,
  resumeUrl VARCHAR(500),
  status ENUM('applied', 'screening', 'interview', 'offered', 'hired', 'rejected') DEFAULT 'applied',
  appliedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  aiScore DECIMAL(5,2),
  skills JSON,
  experience TEXT,
  education TEXT,
  strengths JSON,
  weaknesses JSON,
  recommendation TEXT,
  summary TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status)
);

-- Interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  candidateId INT NOT NULL,
  interviewerId INT NOT NULL,
  position VARCHAR(100) NOT NULL,
  scheduledAt DATETIME NOT NULL,
  status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
  feedback TEXT,
  rating DECIMAL(2,1),
  meetingLink VARCHAR(500),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (candidateId) REFERENCES candidates(id) ON DELETE CASCADE,
  FOREIGN KEY (interviewerId) REFERENCES users(id),
  INDEX idx_candidate (candidateId),
  INDEX idx_interviewer (interviewerId)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
  isRead BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (userId)
);

-- Chat Messages table
CREATE TABLE IF NOT EXISTS chatMessages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (userId)
);

-- Exit Requests table
CREATE TABLE IF NOT EXISTS exitRequests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  resignationDate DATE NOT NULL,
  lastWorkingDay DATE NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('pending', 'approved', 'completed') DEFAULT 'pending',
  clearanceStatus JSON,
  appliedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (userId)
);

-- Email Configurations table
CREATE TABLE IF NOT EXISTS emailConfigs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  host VARCHAR(255) NOT NULL,
  port INT NOT NULL,
  tls BOOLEAN DEFAULT TRUE,
  enabled BOOLEAN DEFAULT TRUE,
  monitoringInterval INT DEFAULT 300,
  lastChecked TIMESTAMP NULL,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Processed Emails table
CREATE TABLE IF NOT EXISTS processedEmails (
  id INT AUTO_INCREMENT PRIMARY KEY,
  messageId VARCHAR(255) UNIQUE NOT NULL,
  subject VARCHAR(500) NOT NULL,
  fromEmail VARCHAR(255) NOT NULL,
  processedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  attachmentsProcessed INT DEFAULT 0,
  candidatesCreated INT DEFAULT 0,
  status ENUM('success', 'partial', 'failed') DEFAULT 'success',
  error TEXT,
  INDEX idx_message_id (messageId)
);
