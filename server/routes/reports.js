const express = require('express');
const { getPool } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get attendance report
router.get('/attendance', authenticateToken, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required'
      });
    }

    const pool = getPool();

    let query = `
      SELECT a.*, u.firstName, u.lastName, u.department, u.position
      FROM attendance a
      JOIN users u ON a.userId = u.id
      WHERE a.date BETWEEN ? AND ?
    `;
    const params = [startDate, endDate];

    if (userId) {
      query += ' AND a.userId = ?';
      params.push(userId);
    }

    query += ' ORDER BY a.date DESC, u.firstName';

    const [attendance] = await pool.execute(query, params);

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Get attendance report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate attendance report'
    });
  }
});

// Get leave report
router.get('/leaves', authenticateToken, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required'
      });
    }

    const pool = getPool();

    let query = `
      SELECT l.*, u.firstName, u.lastName, u.department, u.position
      FROM leaves l
      JOIN users u ON l.userId = u.id
      WHERE l.appliedAt BETWEEN ? AND ?
    `;
    const params = [startDate, endDate];

    if (userId) {
      query += ' AND l.userId = ?';
      params.push(userId);
    }

    query += ' ORDER BY l.appliedAt DESC, u.firstName';

    const [leaves] = await pool.execute(query, params);

    res.json({
      success: true,
      data: leaves
    });
  } catch (error) {
    console.error('Get leave report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate leave report'
    });
  }
});

// Get payroll report
router.get('/payroll', authenticateToken, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const { year, month, userId } = req.query;

    if (!year) {
      return res.status(400).json({
        success: false,
        message: 'year is required'
      });
    }

    const pool = getPool();

    let query = `
      SELECT p.*, u.firstName, u.lastName, u.department, u.position
      FROM payroll p
      JOIN users u ON p.userId = u.id
      WHERE p.year = ?
    `;
    const params = [year];

    if (month) {
      query += ' AND p.month = ?';
      params.push(month);
    }

    if (userId) {
      query += ' AND p.userId = ?';
      params.push(userId);
    }

    query += ' ORDER BY p.month DESC, u.firstName';

    const [payroll] = await pool.execute(query, params);

    res.json({
      success: true,
      data: payroll
    });
  } catch (error) {
    console.error('Get payroll report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate payroll report'
    });
  }
});

// Get performance report
router.get('/performance', authenticateToken, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const { period, userId } = req.query;

    const pool = getPool();

    let query = `
      SELECT p.*, u.firstName, u.lastName, u.department, u.position,
             r.firstName as reviewerFirstName, r.lastName as reviewerLastName
      FROM performance p
      JOIN users u ON p.userId = u.id
      JOIN users r ON p.reviewerId = r.id
      WHERE 1=1
    `;
    const params = [];

    if (period) {
      query += ' AND p.period = ?';
      params.push(period);
    }

    if (userId) {
      query += ' AND p.userId = ?';
      params.push(userId);
    }

    query += ' ORDER BY p.createdAt DESC, u.firstName';

    const [performance] = await pool.execute(query, params);

    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('Get performance report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate performance report'
    });
  }
});

// Get dashboard analytics
router.get('/dashboard-analytics', authenticateToken, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const pool = getPool();

    // Get various counts and statistics
    const [userStats] = await pool.execute(`
      SELECT
        COUNT(*) as totalUsers,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as adminCount,
        SUM(CASE WHEN role = 'hr' THEN 1 ELSE 0 END) as hrCount,
        SUM(CASE WHEN role = 'employee' THEN 1 ELSE 0 END) as employeeCount,
        SUM(CASE WHEN role = 'candidate' THEN 1 ELSE 0 END) as candidateCount
      FROM users
      WHERE isActive = TRUE
    `);

    const [leaveStats] = await pool.execute(`
      SELECT
        COUNT(*) as totalLeaves,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingLeaves,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approvedLeaves,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejectedLeaves
      FROM leaves
      WHERE appliedAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    const [candidateStats] = await pool.execute(`
      SELECT
        COUNT(*) as totalCandidates,
        SUM(CASE WHEN status = 'applied' THEN 1 ELSE 0 END) as appliedCandidates,
        SUM(CASE WHEN status = 'hired' THEN 1 ELSE 0 END) as hiredCandidates
      FROM candidates
      WHERE appliedAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    const [attendanceStats] = await pool.execute(`
      SELECT
        COUNT(*) as totalAttendance,
        AVG(hoursWorked) as avgHoursWorked
      FROM attendance
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);

    res.json({
      success: true,
      data: {
        users: userStats[0],
        leaves: leaveStats[0],
        candidates: candidateStats[0],
        attendance: attendanceStats[0]
      }
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate dashboard analytics'
    });
  }
});

module.exports = router;
