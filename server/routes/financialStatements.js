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
      WHERE fs.customer_id = $1
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

module.exports = router;
