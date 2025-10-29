const express = require('express');
const { getPool } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get interviews by candidate
router.get('/candidate/:candidateId', authenticateToken, async (req, res) => {
  try {
    const { candidateId } = req.params;
    const pool = getPool();

    const [interviews] = await pool.execute(
      `SELECT i.*, u.firstName, u.lastName, c.firstName as candidateFirstName, c.lastName as candidateLastName
       FROM interviews i
       JOIN users u ON i.interviewerId = u.id
       JOIN candidates c ON i.candidateId = c.id
       WHERE i.candidateId = ?
       ORDER BY i.scheduledAt DESC`,
      [candidateId]
    );

    res.json({
      success: true,
      data: interviews
    });
  } catch (error) {
    console.error('Get interviews by candidate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interviews'
    });
  }
});

// Get interviews by interviewer
router.get('/interviewer/:interviewerId', authenticateToken, async (req, res) => {
  try {
    const { interviewerId } = req.params;
    const pool = getPool();

    const [interviews] = await pool.execute(
      `SELECT i.*, c.firstName, c.lastName, c.email, c.position
       FROM interviews i
       JOIN candidates c ON i.candidateId = c.id
       WHERE i.interviewerId = ?
       ORDER BY i.scheduledAt DESC`,
      [interviewerId]
    );

    res.json({
      success: true,
      data: interviews
    });
  } catch (error) {
    console.error('Get interviews by interviewer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interviews'
    });
  }
});

// Get all interviews
router.get('/', authenticateToken, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const pool = getPool();
    const [interviews] = await pool.execute(
      `SELECT i.*, c.firstName as candidateFirstName, c.lastName as candidateLastName,
              u.firstName as interviewerFirstName, u.lastName as interviewerLastName
       FROM interviews i
       JOIN candidates c ON i.candidateId = c.id
       JOIN users u ON i.interviewerId = u.id
       ORDER BY i.scheduledAt DESC`
    );

    res.json({
      success: true,
      data: interviews
    });
  } catch (error) {
    console.error('Get all interviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interviews'
    });
  }
});

// Schedule interview
router.post('/', authenticateToken, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const { candidateId, interviewerId, position, scheduledAt, meetingLink } = req.body;

    if (!candidateId || !interviewerId || !position || !scheduledAt) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: candidateId, interviewerId, position, scheduledAt'
      });
    }

    const pool = getPool();

    // Insert interview
    const [result] = await pool.execute(
      `INSERT INTO interviews (candidateId, interviewerId, position, scheduledAt, meetingLink)
       VALUES (?, ?, ?, ?, ?)`,
      [candidateId, interviewerId, position, scheduledAt, meetingLink || null]
    );

    // Get the created interview
    const [newInterviews] = await pool.execute(
      'SELECT * FROM interviews WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      data: newInterviews[0]
    });
  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule interview'
    });
  }
});

// Update interview status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback, rating } = req.body;

    const validStatuses = ['scheduled', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status required: scheduled, completed, or cancelled'
      });
    }

    const pool = getPool();

    // Update interview status
    await pool.execute(
      'UPDATE interviews SET status = ?, feedback = ?, rating = ? WHERE id = ?',
      [status, feedback || null, rating || null, id]
    );

    // Get updated interview
    const [updatedInterviews] = await pool.execute(
      'SELECT * FROM interviews WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: `Interview status updated to ${status}`,
      data: updatedInterviews[0]
    });
  } catch (error) {
    console.error('Update interview status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update interview status'
    });
  }
});

// Reschedule interview
router.put('/:id/reschedule', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { newScheduledAt, meetingLink } = req.body;

    if (!newScheduledAt) {
      return res.status(400).json({
        success: false,
        message: 'newScheduledAt is required'
      });
    }

    const pool = getPool();

    // Update interview schedule
    await pool.execute(
      'UPDATE interviews SET scheduledAt = ?, meetingLink = ? WHERE id = ?',
      [newScheduledAt, meetingLink || null, id]
    );

    // Get updated interview
    const [updatedInterviews] = await pool.execute(
      'SELECT * FROM interviews WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Interview rescheduled successfully',
      data: updatedInterviews[0]
    });
  } catch (error) {
    console.error('Reschedule interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reschedule interview'
    });
  }
});

// Get interview calendar
router.get('/calendar', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, interviewerId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required'
      });
    }

    const pool = getPool();

    let query = `
      SELECT i.*, c.firstName, c.lastName, c.email, c.position,
             u.firstName as interviewerFirstName, u.lastName as interviewerLastName
      FROM interviews i
      JOIN candidates c ON i.candidateId = c.id
      JOIN users u ON i.interviewerId = u.id
      WHERE i.scheduledAt BETWEEN ? AND ?
    `;
    const params = [startDate, endDate];

    if (interviewerId) {
      query += ' AND i.interviewerId = ?';
      params.push(interviewerId);
    }

    query += ' ORDER BY i.scheduledAt ASC';

    const [interviews] = await pool.execute(query, params);

    res.json({
      success: true,
      data: interviews
    });
  } catch (error) {
    console.error('Get interview calendar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interview calendar'
    });
  }
});

module.exports = router;
