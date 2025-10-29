const express = require('express');
const { getPool } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get payroll by user
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const pool = getPool();

    const [payroll] = await pool.execute(
      'SELECT * FROM payroll WHERE userId = ? ORDER BY year DESC, month DESC',
      [userId]
    );

    res.json({
      success: true,
      data: payroll
    });
  } catch (error) {
    console.error('Get payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payroll'
    });
  }
});

// Get all payroll
router.get('/', authenticateToken, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const pool = getPool();
    const [payroll] = await pool.execute(
      'SELECT p.*, u.firstName, u.lastName FROM payroll p JOIN users u ON p.userId = u.id ORDER BY p.year DESC, p.month DESC, u.firstName'
    );

    res.json({
      success: true,
      data: payroll
    });
  } catch (error) {
    console.error('Get all payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payroll'
    });
  }
});

// Process payroll
router.post('/process', authenticateToken, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const { userId, month, year, baseSalary, allowances, deductions } = req.body;

    if (!userId || !month || !year || baseSalary === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: userId, month, year, baseSalary'
      });
    }

    const pool = getPool();

    // Check if payroll already exists for this period
    const [existingPayroll] = await pool.execute(
      'SELECT id FROM payroll WHERE userId = ? AND month = ? AND year = ?',
      [userId, month, year]
    );

    if (existingPayroll.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Payroll already exists for this period'
      });
    }

    const allowancesAmount = allowances || 0;
    const deductionsAmount = deductions || 0;
    const netSalary = baseSalary + allowancesAmount - deductionsAmount;

    // Insert payroll record
    const [result] = await pool.execute(
      `INSERT INTO payroll (userId, month, year, baseSalary, allowances, deductions, netSalary, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'processed')`,
      [userId, month, year, baseSalary, allowancesAmount, deductionsAmount, netSalary]
    );

    // Get the created payroll
    const [newPayroll] = await pool.execute(
      'SELECT * FROM payroll WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Payroll processed successfully',
      data: newPayroll[0]
    });
  } catch (error) {
    console.error('Process payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payroll'
    });
  }
});

// Generate payslip
router.post('/:id/payslip', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    // Get payroll details
    const [payroll] = await pool.execute(
      `SELECT p.*, u.firstName, u.lastName, u.email, u.position, u.department
       FROM payroll p
       JOIN users u ON p.userId = u.id
       WHERE p.id = ?`,
      [id]
    );

    if (payroll.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }

    const record = payroll[0];

    // Update status to paid
    await pool.execute(
      "UPDATE payroll SET status = 'paid' WHERE id = ?",
      [id]
    );

    // Generate simple payslip data (in a real app, you'd generate PDF)
    const payslipData = {
      employeeName: `${record.firstName} ${record.lastName}`,
      employeeEmail: record.email,
      position: record.position,
      department: record.department,
      period: `${record.month} ${record.year}`,
      baseSalary: record.baseSalary,
      allowances: record.allowances,
      deductions: record.deductions,
      netSalary: record.netSalary,
      generatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Payslip generated successfully',
      data: payslipData
    });
  } catch (error) {
    console.error('Generate payslip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate payslip'
    });
  }
});

// Update payroll status
router.put('/:id/status', authenticateToken, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'processed', 'paid'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status required: pending, processed, or paid'
      });
    }

    const pool = getPool();

    // Update payroll status
    await pool.execute(
      'UPDATE payroll SET status = ? WHERE id = ?',
      [status, id]
    );

    // Get updated payroll
    const [updatedPayroll] = await pool.execute(
      'SELECT * FROM payroll WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: `Payroll status updated to ${status}`,
      data: updatedPayroll[0]
    });
  } catch (error) {
    console.error('Update payroll status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payroll status'
    });
  }
});

module.exports = router;
