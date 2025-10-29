const express = require('express');
const { getPool } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all candidates
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const [candidates] = await pool.execute(
      'SELECT * FROM candidates ORDER BY appliedAt DESC'
    );

    res.json({
      success: true,
      data: candidates
    });
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch candidates'
    });
  }
});

// Get candidate by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [candidates] = await pool.execute(
      'SELECT * FROM candidates WHERE id = ?',
      [id]
    );

    if (candidates.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    res.json({
      success: true,
      data: candidates[0]
    });
  } catch (error) {
    console.error('Get candidate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch candidate'
    });
  }
});

// Create candidate
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, position, resumeUrl } = req.body;

    if (!firstName || !lastName || !email || !phone || !position) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: firstName, lastName, email, phone, position'
      });
    }

    const pool = getPool();

    // Check if candidate already exists
    const [existingCandidates] = await pool.execute(
      'SELECT id FROM candidates WHERE email = ?',
      [email]
    );

    if (existingCandidates.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Candidate with this email already exists'
      });
    }

    // Insert new candidate
    const [result] = await pool.execute(
      `INSERT INTO candidates (firstName, lastName, email, phone, position, resumeUrl, appliedAt)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [firstName, lastName, email, phone, position, resumeUrl || null]
    );

    // Get the created candidate
    const [newCandidates] = await pool.execute(
      'SELECT * FROM candidates WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Candidate created successfully',
      data: newCandidates[0]
    });
  } catch (error) {
    console.error('Create candidate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create candidate'
    });
  }
});

// Update candidate status
router.put('/:id/status', authenticateToken, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['applied', 'screening', 'interview', 'offered', 'hired', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status required'
      });
    }

    const pool = getPool();

    // Update candidate status
    await pool.execute(
      'UPDATE candidates SET status = ? WHERE id = ?',
      [status, id]
    );

    // Get updated candidate
    const [updatedCandidates] = await pool.execute(
      'SELECT * FROM candidates WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: `Candidate status updated to ${status}`,
      data: updatedCandidates[0]
    });
  } catch (error) {
    console.error('Update candidate status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update candidate status'
    });
  }
});

// Update candidate AI score
router.put('/:id/ai-score', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { aiScore, skills, experience, education, strengths, weaknesses, recommendation, summary } = req.body;

    const pool = getPool();

    // Update candidate AI data
    await pool.execute(
      `UPDATE candidates SET
        aiScore = ?, skills = ?, experience = ?, education = ?,
        strengths = ?, weaknesses = ?, recommendation = ?, summary = ?
       WHERE id = ?`,
      [
        aiScore, JSON.stringify(skills), experience, education,
        JSON.stringify(strengths), JSON.stringify(weaknesses), recommendation, summary, id
      ]
    );

    // Get updated candidate
    const [updatedCandidates] = await pool.execute(
      'SELECT * FROM candidates WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Candidate AI score updated successfully',
      data: updatedCandidates[0]
    });
  } catch (error) {
    console.error('Update candidate AI score error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update candidate AI score'
    });
  }
});

// Search candidates
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { searchTerm, position, status } = req.query;
    const pool = getPool();

    let query = 'SELECT * FROM candidates WHERE 1=1';
    const params = [];

    if (searchTerm) {
      query += ' AND (firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR position LIKE ?)';
      const searchPattern = `%${searchTerm}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (position) {
      query += ' AND position = ?';
      params.push(position);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY appliedAt DESC';

    const [candidates] = await pool.execute(query, params);

    res.json({
      success: true,
      data: candidates
    });
  } catch (error) {
    console.error('Search candidates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search candidates'
    });
  }
});

module.exports = router;
