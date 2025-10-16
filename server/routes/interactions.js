const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET all interactions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT
        i.*,
        c.company_name,
        con.first_name || ' ' || con.last_name as contact_name
      FROM interaction i
      LEFT JOIN customer c ON i.customer_id = c.customer_id
      LEFT JOIN contact con ON i.contact_id = con.contact_id
    `;

    const queryParams = [];
    let whereConditions = [];

    if (search) {
      whereConditions.push(`(
        i.subject ILIKE $1 OR
        i.description ILIKE $1 OR
        c.company_name ILIKE $1
      )`);
      queryParams.push(`%${search}%`);
    }

    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    query += ` ORDER BY i.interaction_date DESC`;

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
    const countResult = await pool.query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    res.json({
      interactions: result.rows,
      total: totalCount,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching interactions:', error);
    res.status(500).json({ error: 'Failed to fetch interactions', message: error.message });
  }
});

// POST create new interaction
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      interaction_type,
      subject,
      description,
      interaction_date,
      customer_id,
      contact_id,
      duration_minutes,
      direction,
      medium,
      outcome,
      sentiment,
      importance,
      location,
      private_notes
    } = req.body;

    const query = `
      INSERT INTO interaction (
        interaction_type, subject, description, interaction_date,
        customer_id, contact_id, duration_minutes, direction,
        medium, outcome, sentiment, importance, location, private_notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const values = [
      interaction_type, subject, description, interaction_date,
      customer_id, contact_id, duration_minutes, direction,
      medium, outcome, sentiment, importance, location, private_notes
    ];

    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating interaction:', error);
    res.status(500).json({ error: 'Failed to create interaction', message: error.message });
  }
});

module.exports = router;
