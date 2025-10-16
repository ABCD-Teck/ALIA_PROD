const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET all tasks
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const query = `
      SELECT
        t.*,
        c.company_name
      FROM task t
      LEFT JOIN customer c ON t.customer_id = c.customer_id
      WHERE t.is_deleted = false
      ORDER BY t.due_at ASC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);

    res.json({
      tasks: result.rows,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks', message: error.message });
  }
});

// GET single task by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        t.*,
        c.company_name,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name
      FROM task t
      LEFT JOIN customer c ON t.customer_id = c.customer_id
      LEFT JOIN "user" u ON t.owner_user_id = u.user_id
      WHERE t.task_id = $1 AND t.is_deleted = false
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task', message: error.message });
  }
});

// POST create new task
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      due_at,
      priority,
      status,
      customer_id,
      opportunity_id,
      contact_id,
      owner_user_id,
      notes,
      tags
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const query = `
      INSERT INTO task (
        title, description, due_at, priority, status,
        customer_id, opportunity_id, contact_id, owner_user_id,
        notes, tags, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      title,
      description,
      due_at,
      priority || 'medium',
      status || 'pending',
      customer_id,
      opportunity_id,
      contact_id,
      owner_user_id || req.user.user_id, // Use current user if not specified
      notes,
      tags
    ];

    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task', message: error.message });
  }
});

// PUT update task
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      due_at,
      priority,
      status,
      customer_id,
      opportunity_id,
      contact_id,
      owner_user_id,
      notes,
      tags
    } = req.body;

    const query = `
      UPDATE task SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        due_at = COALESCE($3, due_at),
        priority = COALESCE($4, priority),
        status = COALESCE($5, status),
        customer_id = COALESCE($6, customer_id),
        opportunity_id = COALESCE($7, opportunity_id),
        contact_id = COALESCE($8, contact_id),
        owner_user_id = COALESCE($9, owner_user_id),
        notes = COALESCE($10, notes),
        tags = COALESCE($11, tags),
        updated_at = NOW()
      WHERE task_id = $12 AND is_deleted = false
      RETURNING *
    `;

    const values = [
      title, description, due_at, priority, status,
      customer_id, opportunity_id, contact_id, owner_user_id,
      notes, tags, id
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task', message: error.message });
  }
});

// DELETE task (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE task
      SET is_deleted = true, updated_at = NOW()
      WHERE task_id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully', task: result.rows[0] });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task', message: error.message });
  }
});

module.exports = router;
