const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET all opportunities
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, limit = 50, offset = 0, include_archived } = req.query;

    let query = `
      SELECT
        o.*,
        c.company_name,
        cu.code as currency_code,
        cu.code as currency_symbol,
        r.region_name as region_name
      FROM opportunity o
      LEFT JOIN customer c ON o.customer_id = c.customer_id
      LEFT JOIN currency cu ON o.currency_id = cu.currency_id
      LEFT JOIN region r ON o.region_id = r.region_id
      WHERE 1=1
    `;

    const queryParams = [];

    // Filter out archived opportunities by default
    if (include_archived !== 'true') {
      query += ` AND (o.is_deleted = FALSE OR o.is_deleted IS NULL)`;
    }

    if (search) {
      const paramIndex = queryParams.length + 1;
      query += ` AND (
        o.name ILIKE $${paramIndex} OR
        o.description ILIKE $${paramIndex} OR
        c.company_name ILIKE $${paramIndex}
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

    // Filter out archived opportunities by default
    if (include_archived !== 'true') {
      countQuery += ` AND (o.is_deleted = FALSE OR o.is_deleted IS NULL)`;
    }

    if (search) {
      const paramIndex = queryParams.length > 0 ? 1 : 1;
      countQuery += ` AND (
        o.name ILIKE $${paramIndex} OR
        o.description ILIKE $${paramIndex} OR
        c.company_name ILIKE $${paramIndex}
      )`;
    }

    const countResult = await pool.query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Transform stage and priority to lowercase for frontend
    const transformedOpportunities = result.rows.map(opp => ({
      ...opp,
      stage: opp.stage ? opp.stage.toLowerCase() : opp.stage,
      priority: opp.priority ? opp.priority.toLowerCase() : opp.priority
    }));

    res.json({
      opportunities: transformedOpportunities,
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

    // Transform stage and priority to lowercase for frontend
    const opportunity = {
      ...result.rows[0],
      stage: result.rows[0].stage ? result.rows[0].stage.toLowerCase() : result.rows[0].stage,
      priority: result.rows[0].priority ? result.rows[0].priority.toLowerCase() : result.rows[0].priority
    };

    res.json(opportunity);
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
      amount,
      currency_id,
      stage,
      probability,
      expected_close_date,
      owner_user_id,
      source,
      priority
    } = req.body;

    // Validate required fields
    if (!name || !customer_id) {
      return res.status(400).json({ error: 'Name and customer_id are required' });
    }

    const query = `
      INSERT INTO opportunity (
        customer_id, name, description, amount, currency_id,
        stage, probability, expected_close_date, owner_user_id,
        priority, created_at, updated_at, created_by, updated_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), $11, $12)
      RETURNING *
    `;

    const values = [
      customer_id,
      name,
      description,
      value || amount, // Accept both value and amount for backwards compatibility
      currency_id,
      (stage ? stage.toUpperCase() : 'PROSPECT'),  // Convert to uppercase for database
      probability || 0,
      expected_close_date,
      owner_user_id || req.user.user_id, // Use current user if not specified
      (priority ? priority.toUpperCase() : 'MEDIUM'),  // Convert to uppercase for database
      req.user.user_id, // created_by
      req.user.user_id  // updated_by
    ];

    const result = await pool.query(query, values);

    // Transform stage and priority to lowercase for frontend
    const opportunity = {
      ...result.rows[0],
      stage: result.rows[0].stage ? result.rows[0].stage.toLowerCase() : result.rows[0].stage,
      priority: result.rows[0].priority ? result.rows[0].priority.toLowerCase() : result.rows[0].priority
    };

    res.status(201).json(opportunity);
  } catch (error) {
    console.error('Error creating opportunity:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      table: error.table,
      constraint: error.constraint
    });
    res.status(500).json({
      error: 'Failed to create opportunity',
      message: error.message,
      detail: error.detail || error.message
    });
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
      amount,
      currency_id,
      stage,
      probability,
      expected_close_date,
      owner_user_id,
      source,
      priority,
      region_id,
      country_code
    } = req.body;

    const query = `
      UPDATE opportunity SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        amount = COALESCE($3, amount),
        currency_id = COALESCE($4, currency_id),
        stage = COALESCE($5, stage),
        probability = COALESCE($6, probability),
        expected_close_date = COALESCE($7, expected_close_date),
        owner_user_id = COALESCE($8, owner_user_id),
        priority = COALESCE($9, priority),
        region_id = COALESCE($10, region_id),
        country_code = COALESCE($11, country_code),
        updated_at = NOW(),
        updated_by = $12
      WHERE opportunity_id = $13
      RETURNING *
    `;

    const values = [
      name,
      description,
      value || amount,
      currency_id,
      stage ? stage.toUpperCase() : stage,  // Convert to uppercase for database
      probability,
      expected_close_date,
      owner_user_id,
      priority ? priority.toUpperCase() : priority,  // Convert to uppercase for database
      region_id,
      country_code,
      req.user.user_id,
      id
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    // Transform stage and priority to lowercase for frontend
    const opportunity = {
      ...result.rows[0],
      stage: result.rows[0].stage ? result.rows[0].stage.toLowerCase() : result.rows[0].stage,
      priority: result.rows[0].priority ? result.rows[0].priority.toLowerCase() : result.rows[0].priority
    };

    res.json(opportunity);
  } catch (error) {
    console.error('Error updating opportunity:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      table: error.table,
      constraint: error.constraint
    });
    res.status(500).json({
      error: 'Failed to update opportunity',
      message: error.message,
      detail: error.detail || error.message
    });
  }
});

// DELETE opportunity (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE opportunity
      SET
        is_deleted = TRUE,
        archived_at = NOW(),
        archived_by = $2,
        updated_at = NOW()
      WHERE opportunity_id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id, req.user.user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    res.json({ message: 'Opportunity deleted successfully', opportunity: result.rows[0] });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    res.status(500).json({ error: 'Failed to delete opportunity', message: error.message });
  }
});

// PATCH archive opportunity
router.patch('/:id/archive', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE opportunity
      SET
        is_deleted = TRUE,
        archived_at = NOW(),
        archived_by = $2,
        updated_at = NOW()
      WHERE opportunity_id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id, req.user.user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    res.json({ message: 'Opportunity archived successfully', opportunity: result.rows[0] });
  } catch (error) {
    console.error('Error archiving opportunity:', error);
    res.status(500).json({ error: 'Failed to archive opportunity', message: error.message });
  }
});

// PATCH restore opportunity from archive
router.patch('/:id/restore', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE opportunity
      SET
        is_deleted = FALSE,
        archived_at = NULL,
        archived_by = NULL,
        updated_at = NOW()
      WHERE opportunity_id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    res.json({ message: 'Opportunity restored successfully', opportunity: result.rows[0] });
  } catch (error) {
    console.error('Error restoring opportunity:', error);
    res.status(500).json({ error: 'Failed to restore opportunity', message: error.message });
  }
});

module.exports = router;
