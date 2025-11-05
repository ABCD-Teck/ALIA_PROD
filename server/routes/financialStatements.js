const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET financial statements for a customer
router.get('/customer/:customerId', authenticateToken, async (req, res) => {
  try {
    const { customerId } = req.params;

    const query = `
      SELECT
        fs.*,
        cu.code as currency_code,
        cu.symbol as currency_symbol
      FROM financial_statement fs
      LEFT JOIN currency cu ON fs.currency_id = cu.currency_id
      WHERE fs.customer_id = $1 AND fs.is_active = true
      ORDER BY fs.fiscal_year DESC
    `;

    const result = await pool.query(query, [customerId]);

    res.json({
      statements: result.rows
    });
  } catch (error) {
    console.error('Error fetching financial statements:', error);
    res.status(500).json({ error: 'Failed to fetch financial statements', message: error.message });
  }
});

// GET single financial statement by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        fs.*,
        cu.code as currency_code,
        cu.symbol as currency_symbol
      FROM financial_statement fs
      LEFT JOIN currency cu ON fs.currency_id = cu.currency_id
      WHERE fs.financial_statement_id = $1 AND fs.is_active = true
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Financial statement not found' });
    }

    res.json({
      statement: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching financial statement:', error);
    res.status(500).json({ error: 'Failed to fetch financial statement', message: error.message });
  }
});

// POST create new financial statement
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      customer_id,
      fiscal_year,
      revenue,
      net_profit,
      roe,
      debt_ratio,
      currency_id,
      notes
    } = req.body;

    // Validation
    if (!customer_id || !fiscal_year) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'customer_id and fiscal_year are required'
      });
    }

    // Check if financial statement already exists for this customer and year
    const checkQuery = `
      SELECT financial_statement_id FROM financial_statement
      WHERE customer_id = $1 AND fiscal_year = $2 AND is_active = true
    `;
    const checkResult = await pool.query(checkQuery, [customer_id, fiscal_year]);

    if (checkResult.rows.length > 0) {
      return res.status(409).json({
        error: 'Financial statement already exists',
        message: `A financial statement for fiscal year ${fiscal_year} already exists for this customer`
      });
    }

    const query = `
      INSERT INTO financial_statement (
        customer_id, fiscal_year, revenue, net_profit, roe, debt_ratio,
        currency_id, notes, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      customer_id,
      fiscal_year,
      revenue || null,
      net_profit || null,
      roe || null,
      debt_ratio || null,
      currency_id || null,
      notes || null,
      req.user.user_id
    ];

    const result = await pool.query(query, values);

    // Fetch the created statement with currency info
    const fetchQuery = `
      SELECT
        fs.*,
        cu.code as currency_code,
        cu.symbol as currency_symbol
      FROM financial_statement fs
      LEFT JOIN currency cu ON fs.currency_id = cu.currency_id
      WHERE fs.financial_statement_id = $1
    `;
    const fetchResult = await pool.query(fetchQuery, [result.rows[0].financial_statement_id]);

    res.status(201).json({
      statement: fetchResult.rows[0],
      message: 'Financial statement created successfully'
    });
  } catch (error) {
    console.error('Error creating financial statement:', error);
    res.status(500).json({ error: 'Failed to create financial statement', message: error.message });
  }
});

// PUT update financial statement
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fiscal_year,
      revenue,
      net_profit,
      roe,
      debt_ratio,
      currency_id,
      notes
    } = req.body;

    // Check if statement exists
    const checkQuery = `
      SELECT financial_statement_id FROM financial_statement
      WHERE financial_statement_id = $1 AND is_active = true
    `;
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Financial statement not found' });
    }

    const query = `
      UPDATE financial_statement
      SET
        fiscal_year = COALESCE($1, fiscal_year),
        revenue = COALESCE($2, revenue),
        net_profit = COALESCE($3, net_profit),
        roe = COALESCE($4, roe),
        debt_ratio = COALESCE($5, debt_ratio),
        currency_id = COALESCE($6, currency_id),
        notes = COALESCE($7, notes),
        updated_at = NOW()
      WHERE financial_statement_id = $8 AND is_active = true
      RETURNING *
    `;

    const values = [
      fiscal_year,
      revenue,
      net_profit,
      roe,
      debt_ratio,
      currency_id,
      notes,
      id
    ];

    const result = await pool.query(query, values);

    // Fetch the updated statement with currency info
    const fetchQuery = `
      SELECT
        fs.*,
        cu.code as currency_code,
        cu.symbol as currency_symbol
      FROM financial_statement fs
      LEFT JOIN currency cu ON fs.currency_id = cu.currency_id
      WHERE fs.financial_statement_id = $1
    `;
    const fetchResult = await pool.query(fetchQuery, [id]);

    res.json({
      statement: fetchResult.rows[0],
      message: 'Financial statement updated successfully'
    });
  } catch (error) {
    console.error('Error updating financial statement:', error);
    res.status(500).json({ error: 'Failed to update financial statement', message: error.message });
  }
});

// DELETE financial statement (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE financial_statement
      SET is_active = false, updated_at = NOW()
      WHERE financial_statement_id = $1 AND is_active = true
      RETURNING financial_statement_id
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Financial statement not found' });
    }

    res.json({
      message: 'Financial statement deleted successfully',
      financial_statement_id: result.rows[0].financial_statement_id
    });
  } catch (error) {
    console.error('Error deleting financial statement:', error);
    res.status(500).json({ error: 'Failed to delete financial statement', message: error.message });
  }
});

module.exports = router;
