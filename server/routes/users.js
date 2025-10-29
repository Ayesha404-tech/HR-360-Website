const express = require('express');
const { getPool } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all users
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const [users] = await pool.execute(
      'SELECT id, email, firstName, lastName, role, department, position, joinDate, salary, isActive, avatar, phone FROM users ORDER BY firstName, lastName'
    );

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [users] = await pool.execute(
      'SELECT id, email, firstName, lastName, role, department, position, joinDate, salary, isActive, avatar, phone FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

// Create user
router.post('/', authenticateToken, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const { email, passwordHash, firstName, lastName, role, department, position, salary, joinDate, isActive } = req.body;

    if (!email || !passwordHash || !firstName || !lastName || !role) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: email, passwordHash, firstName, lastName, role'
      });
    }

    const pool = getPool();

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Insert new user
    const [result] = await pool.execute(
      `INSERT INTO users (email, firstName, lastName, role, department, position, salary, joinDate, isActive, passwordHash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, firstName, lastName, role, department || null, position || null, salary || null, joinDate || null, isActive !== undefined ? isActive : true, passwordHash]
    );

    // Get the created user
    const [newUsers] = await pool.execute(
      'SELECT id, email, firstName, lastName, role, department, position, joinDate, salary, isActive FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUsers[0]
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
});

// Update user
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role, department, position, salary, isActive } = req.body;

    // Check permissions - users can update themselves, admins/hr can update anyone
    if (req.user.id != id && !['admin', 'hr'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const pool = getPool();

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user
    await pool.execute(
      `UPDATE users SET firstName = ?, lastName = ?, role = ?, department = ?, position = ?, salary = ?, isActive = ? WHERE id = ?`,
      [firstName, lastName, role, department, position, salary, isActive, id]
    );

    // Get updated user
    const [updatedUsers] = await pool.execute(
      'SELECT id, email, firstName, lastName, role, department, position, joinDate, salary, isActive FROM users WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUsers[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// Delete user
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user (cascade will handle related records)
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

module.exports = router;
