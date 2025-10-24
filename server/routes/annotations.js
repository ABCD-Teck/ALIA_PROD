const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET all annotations for a customer
router.get('/customer/:customerId', authenticateToken, async (req, res) => {
  try {
    const { customerId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const query = `
      SELECT
        a.*,
        u.first_name || ' ' || u.last_name as author_name
      FROM annotation a
      LEFT JOIN "user" u ON a.created_by = u.user_id
      WHERE a.customer_id = $1 AND a.is_active = true
      ORDER BY a.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [customerId, limit, offset]);

    const countQuery = `
      SELECT COUNT(*) FROM annotation
      WHERE customer_id = $1 AND is_active = true
    `;
    const countResult = await pool.query(countQuery, [customerId]);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      annotations: result.rows,
      total: totalCount,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching annotations:', error);
    res.status(500).json({ error: 'Failed to fetch annotations', message: error.message });
  }
});

// GET single annotation by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        a.*,
        u.first_name || ' ' || u.last_name as author_name
      FROM annotation a
      LEFT JOIN "user" u ON a.created_by = u.user_id
      WHERE a.annotation_id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Annotation not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching annotation:', error);
    res.status(500).json({ error: 'Failed to fetch annotation', message: error.message });
  }
});

// POST create new annotation
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      customer_id,
      title,
      status,
      content
    } = req.body;

    if (!customer_id || !title || !title.trim()) {
      return res.status(400).json({ error: 'customer_id and title are required' });
    }

    const trimmedTitle = title.trim();
    const trimmedStatus = typeof status === 'string' ? status.trim() : null;
    const trimmedContent = typeof content === 'string' && content.trim().length > 0 ? content.trim() : null;

    if (trimmedStatus) {
      const wordCount = trimmedStatus.split(/\s+/).filter(Boolean).length;
      if (wordCount > 500) {
        return res.status(400).json({ error: 'Status exceeds 500 word limit', wordCount });
      }
    }

    const query = `
      INSERT INTO annotation (
        customer_id,
        title,
        status,
        content,
        created_by
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      customer_id,
      trimmedTitle,
      trimmedStatus || 'active',
      trimmedContent,
      req.user.user_id // From auth middleware
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      message: 'Annotation created successfully',
      annotation: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating annotation:', error);
    res.status(500).json({ error: 'Failed to create annotation', message: error.message });
  }
});

// PUT update annotation
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status, content } = req.body;

    const query = `
      UPDATE annotation SET
        title = COALESCE($1, title),
        status = COALESCE($2, status),
        content = COALESCE($3, content),
        updated_at = NOW()
      WHERE annotation_id = $4
      RETURNING *
    `;

    const values = [title, status, content, id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Annotation not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating annotation:', error);
    res.status(500).json({ error: 'Failed to update annotation', message: error.message });
  }
});

// DELETE annotation (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE annotation
      SET is_active = false, updated_at = NOW()
      WHERE annotation_id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Annotation not found' });
    }

    res.json({ message: 'Annotation deleted successfully', annotation: result.rows[0] });
  } catch (error) {
    console.error('Error deleting annotation:', error);
    res.status(500).json({ error: 'Failed to delete annotation', message: error.message });
  }
});

module.exports = router;
