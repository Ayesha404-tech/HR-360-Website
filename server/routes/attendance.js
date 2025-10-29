const express = require('express');
const { getPool } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get attendance by user
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const pool = getPool();

    const [attendance] = await pool.execute(
      'SELECT * FROM attendance WHERE userId = ? ORDER BY date DESC',
      [userId]
    );

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance'
    });
  }
});

// Get all attendance
router.get('/', authenticateToken, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const pool = getPool();
    const [attendance] = await pool.execute(
      'SELECT a.*, u.firstName, u.lastName FROM attendance a JOIN users u ON a.userId = u.id ORDER BY a.date DESC, u.firstName'
    );

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance'
    });
  }
});

// Clock in
router.post('/clock-in/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0];

    // Check permissions - users can clock in for themselves, admins/hr can clock in for anyone
    if (req.user.id != userId && !['admin', 'hr'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const pool = getPool();

    // Check if already clocked in today
    const [existingAttendance] = await pool.execute(
      'SELECT id, clockIn FROM attendance WHERE userId = ? AND date = ?',
      [userId, today]
    );

    if (existingAttendance.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Already clocked in today'
      });
    }

    // Insert clock in record
    const [result] = await pool.execute(
      'INSERT INTO attendance (userId, date, clockIn, status) VALUES (?, ?, ?, ?)',
      [userId, today, now, 'present']
    );

    res.json({
      success: true,
      message: 'Clocked in successfully',
      data: {
        id: result.insertId,
        userId: parseInt(userId),
        date: today,
        clockIn: now,
        status: 'present'
      }
    });
  } catch (error) {
    console.error('Clock in error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clock in'
    });
  }
});

// Clock out
router.post('/clock-out/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0];

    // Check permissions
    if (req.user.id != userId && !['admin', 'hr'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const pool = getPool();

    // Get today's attendance record
    const [attendance] = await pool.execute(
      'SELECT id, clockIn FROM attendance WHERE userId = ? AND date = ? AND clockOut IS NULL',
      [userId, today]
    );

    if (attendance.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active clock-in found for today'
      });
    }

    const record = attendance[0];
    const clockInTime = new Date(`${today} ${record.clockIn}`);
    const clockOutTime = new Date(`${today} ${now}`);
    const hoursWorked = (clockOutTime - clockInTime) / (1000 * 60 * 60);

    // Update clock out and hours worked
    await pool.execute(
      'UPDATE attendance SET clockOut = ?, hoursWorked = ? WHERE id = ?',
      [now, hoursWorked.toFixed(2), record.id]
    );

    res.json({
      success: true,
      message: 'Clocked out successfully',
      data: {
        id: record.id,
        clockOut: now,
        hoursWorked: hoursWorked.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Clock out error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clock out'
    });
  }
});

module.exports = router;
