const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET all opportunities
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT
        o.*,
        c.company_name,
        cu.code as currency_code,
        cu.code as currency_symbol
      FROM opportunity o
      LEFT JOIN customer c ON o.customer_id = c.customer_id
      LEFT JOIN currency cu ON o.currency_id = cu.currency_id
      WHERE 1=1
    `;

    const queryParams = [];

    if (search) {
      query += ` AND (
        o.name ILIKE $1 OR
        o.description ILIKE $1 OR
        c.company_name ILIKE $1
      )`;
      queryParams.push(`%${search}%`);
    }

    query += ` ORDER BY o.created_at DESC`;

    // Get total count
    let countQuery = `
      SELECT COUNT(*)
      FROM opportunity o
      LEFT JOIN customer c ON o.customer_id = c.customer_id
      WHERE 1=1
    `;

    if (search) {
      countQuery += ` AND (
        o.name ILIKE $1 OR
        o.description ILIKE $1 OR
        c.company_name ILIKE $1
      )`;
    }

    const countResult = await pool.query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    res.json({
      opportunities: result.rows,
      total: totalCount,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ error: 'Failed to fetch opportunities', message: error.message });
  }
});

// GET single opportunity by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        o.*,
        c.company_name,
        cu.code as currency_code,
        cu.symbol as currency_symbol
      FROM opportunity o
      LEFT JOIN customer c ON o.customer_id = c.customer_id
      LEFT JOIN currency cu ON o.currency_id = cu.currency_id
      WHERE o.opportunity_id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    res.status(500).json({ error: 'Failed to fetch opportunity', message: error.message });
  }
});

// POST create new opportunity
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      customer_id,
      name,
      description,
      value,
      currency_id,
      stage,
      probability,
      expected_close_date,
      owner_user_id,
      source,
      priority,
      notes
    } = req.body;

    // Validate required fields
    if (!name || !customer_id) {
      return res.status(400).json({ error: 'Name and customer_id are required' });
    }

    const query = `
      INSERT INTO opportunity (
        customer_id, name, description, value, currency_id,
        stage, probability, expected_close_date, owner_user_id,
        source, priority, notes, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      customer_id,
      name,
      description,
      value,
      currency_id,
      stage || 'prospecting',
      probability || 0,
      expected_close_date,
      owner_user_id || req.user.user_id, // Use current user if not specified
      source,
      priority || 'medium',
      notes
    ];

    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating opportunity:', error);
    res.status(500).json({ error: 'Failed to create opportunity', message: error.message });
  }
});

// PUT update opportunity
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      value,
      currency_id,
      stage,
      probability,
      expected_close_date,
      owner_user_id,
      source,
      priority,
      notes
    } = req.body;

    const query = `
      UPDATE opportunity SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        value = COALESCE($3, value),
        currency_id = COALESCE($4, currency_id),
        stage = COALESCE($5, stage),
        probability = COALESCE($6, probability),
        expected_close_date = COALESCE($7, expected_close_date),
        owner_user_id = COALESCE($8, owner_user_id),
        source = COALESCE($9, source),
        priority = COALESCE($10, priority),
        notes = COALESCE($11, notes),
        updated_at = NOW()
      WHERE opportunity_id = $12
      RETURNING *
    `;

    const values = [
      name, description, value, currency_id, stage,
      probability, expected_close_date, owner_user_id,
      source, priority, notes, id
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating opportunity:', error);
    res.status(500).json({ error: 'Failed to update opportunity', message: error.message });
  }
});

// DELETE opportunity (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE opportunity
      SET is_deleted = true, updated_at = NOW()
      WHERE opportunity_id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    res.json({ message: 'Opportunity deleted successfully', opportunity: result.rows[0] });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    res.status(500).json({ error: 'Failed to delete opportunity', message: error.message });
  }
});

module.exports = router;
