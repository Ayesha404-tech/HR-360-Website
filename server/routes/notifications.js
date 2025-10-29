const express = require('express');
const { getPool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get notifications for user
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const pool = getPool();

    const [notifications] = await pool.execute(
      'SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// Create notification
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;

    if (!userId || !title || !message || !type) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: userId, title, message, type'
      });
    }

    const validTypes = ['info', 'success', 'warning', 'error'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Valid type required: info, success, warning, or error'
      });
    }

    const pool = getPool();

    // Insert notification
    const [result] = await pool.execute(
      `INSERT INTO notifications (userId, title, message, type, isRead, createdAt)
       VALUES (?, ?, ?, ?, FALSE, NOW())`,
      [userId, title, message, type]
    );

    // Get the created notification
    const [newNotifications] = await pool.execute(
      'SELECT * FROM notifications WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: newNotifications[0]
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification'
    });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    // Update notification
    await pool.execute(
      'UPDATE notifications SET isRead = TRUE WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// Mark all notifications as read for user
router.put('/user/:userId/read-all', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const pool = getPool();

    // Update all notifications for user
    await pool.execute(
      'UPDATE notifications SET isRead = TRUE WHERE userId = ? AND isRead = FALSE',
      [userId]
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read'
    });
  }
});

module.exports = router;
