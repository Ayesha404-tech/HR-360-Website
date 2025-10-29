const express = require('express');
const { getPool } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get performance by user
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const pool = getPool();

    const [performance] = await pool.execute(
      'SELECT p.*, u.firstName, u.lastName FROM performance p JOIN users u ON p.reviewerId = u.id WHERE p.userId = ? ORDER BY p.createdAt DESC',
      [userId]
    );

    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('Get performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance reviews'
    });
  }
});

// Get all performance reviews
router.get('/', authenticateToken, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const pool = getPool();
    const [performance] = await pool.execute(
      `SELECT p.*, u1.firstName as employeeFirstName, u1.lastName as employeeLastName,
              u2.firstName as reviewerFirstName, u2.lastName as reviewerLastName
       FROM performance p
       JOIN users u1 ON p.userId = u1.id
       JOIN users u2 ON p.reviewerId = u2.id
       ORDER BY p.createdAt DESC`
    );

    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('Get all performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance reviews'
    });
  }
});

// Create performance review
router.post('/', authenticateToken, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const { userId, reviewerId, period, score, feedback, goals, achievements } = req.body;

    if (!userId || !reviewerId || !period || !score || !feedback || !goals || !achievements) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: userId, reviewerId, period, score, feedback, goals, achievements'
      });
    }

    const pool = getPool();

    // Insert performance review
    const [result] = await pool.execute(
      `INSERT INTO performance (userId, reviewerId, period, score, feedback, goals, achievements, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [userId, reviewerId, period, score, feedback, JSON.stringify(goals), JSON.stringify(achievements)]
    );

    // Get the created review
    const [newReviews] = await pool.execute(
      'SELECT * FROM performance WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Performance review created successfully',
      data: newReviews[0]
    });
  } catch (error) {
    console.error('Create performance review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create performance review'
    });
  }
});

// Update performance review
router.put('/:id', authenticateToken, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const { id } = req.params;
    const { score, feedback, goals, achievements } = req.body;

    const pool = getPool();

    // Update performance review
    await pool.execute(
      'UPDATE performance SET score = ?, feedback = ?, goals = ?, achievements = ? WHERE id = ?',
      [score, feedback, JSON.stringify(goals), JSON.stringify(achievements), id]
    );

    // Get updated review
    const [updatedReviews] = await pool.execute(
      'SELECT * FROM performance WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Performance review updated successfully',
      data: updatedReviews[0]
    });
  } catch (error) {
    console.error('Update performance review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update performance review'
    });
  }
});

// Get performance analytics
router.get('/analytics/:userId?', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const pool = getPool();

    let query, params;

    if (userId) {
      query = `
        SELECT
          COUNT(*) as totalReviews,
          AVG(score) as averageScore,
          MAX(score) as highestScore,
          MIN(score) as lowestScore,
          GROUP_CONCAT(DISTINCT period ORDER BY period DESC) as periods
        FROM performance
        WHERE userId = ?
      `;
      params = [userId];
    } else {
      query = `
        SELECT
          COUNT(*) as totalReviews,
          AVG(score) as averageScore,
          MAX(score) as highestScore,
          MIN(score) as lowestScore,
          GROUP_CONCAT(DISTINCT period ORDER BY period DESC) as periods
        FROM performance
      `;
      params = [];
    }

    const [analytics] = await pool.execute(query, params);

    res.json({
      success: true,
      data: analytics[0]
    });
  } catch (error) {
    console.error('Get performance analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance analytics'
    });
  }
});

module.exports = router;
