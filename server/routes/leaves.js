const express = require('express');
const { getPool } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get leaves by user
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const pool = getPool();

    const [leaves] = await pool.execute(
      'SELECT l.*, u.firstName, u.lastName FROM leaves l JOIN users u ON l.approvedBy = u.id WHERE l.userId = ? ORDER BY l.appliedAt DESC',
      [userId]
    );

    res.json({
      success: true,
      data: leaves
    });
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaves'
    });
  }
});

// Get all leaves
router.get('/', authenticateToken, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const pool = getPool();
    const [leaves] = await pool.execute(
      `SELECT l.*, u1.firstName as userFirstName, u1.lastName as userLastName,
              u2.firstName as approverFirstName, u2.lastName as approverLastName
       FROM leaves l
       JOIN users u1 ON l.userId = u1.id
       LEFT JOIN users u2 ON l.approvedBy = u2.id
       ORDER BY l.appliedAt DESC`
    );

    res.json({
      success: true,
      data: leaves
    });
  } catch (error) {
    console.error('Get all leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaves'
    });
  }
});

// Create leave request
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { userId, type, startDate, endDate, reason } = req.body;

    if (!userId || !type || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: userId, type, startDate, endDate, reason'
      });
    }

    const pool = getPool();

    // Insert leave request
    const [result] = await pool.execute(
      `INSERT INTO leaves (userId, type, startDate, endDate, reason, status, appliedAt)
       VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
      [userId, type, startDate, endDate, reason]
    );

    // Get the created leave
    const [newLeaves] = await pool.execute(
      'SELECT * FROM leaves WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Leave request created successfully',
      data: newLeaves[0]
    });
  } catch (error) {
    console.error('Create leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create leave request'
    });
  }
});

// Update leave status
router.put('/:id/status', authenticateToken, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedBy } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status required: approved or rejected'
      });
    }

    if (status === 'approved' && !approvedBy) {
      return res.status(400).json({
        success: false,
        message: 'approvedBy is required when approving'
      });
    }

    const pool = getPool();

    // Update leave status
    await pool.execute(
      'UPDATE leaves SET status = ?, approvedBy = ? WHERE id = ?',
      [status, approvedBy || null, id]
    );

    // Get updated leave
    const [updatedLeaves] = await pool.execute(
      'SELECT * FROM leaves WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: `Leave ${status} successfully`,
      data: updatedLeaves[0]
    });
  } catch (error) {
    console.error('Update leave status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update leave status'
    });
  }
});

module.exports = router;
