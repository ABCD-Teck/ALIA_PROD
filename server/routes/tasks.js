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
        c.company_name,
        con.first_name || ' ' || con.last_name as contact_name
      FROM task t
      LEFT JOIN customer c ON t.customer_id = c.customer_id
      LEFT JOIN contact con ON t.contact_id = con.contact_id
      WHERE t.is_deleted = false
      ORDER BY t.due_date ASC NULLS LAST
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
        u.first_name as assigned_user_first_name,
        u.last_name as assigned_user_last_name,
        con.first_name as contact_first_name,
        con.last_name as contact_last_name
      FROM task t
      LEFT JOIN customer c ON t.customer_id = c.customer_id
      LEFT JOIN "user" u ON t.assigned_to = u.user_id
      LEFT JOIN contact con ON t.contact_id = con.contact_id
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
      subject,
      description,
      due_date,
      priority,
      status,
      customer_id,
      opportunity_id,
      contact_id,
      assigned_to
    } = req.body;

    // Validate required fields
    if (!subject) {
      return res.status(400).json({ error: 'Subject is required' });
    }

    const query = `
      INSERT INTO task (
        subject, description, due_date, priority, status,
        customer_id, opportunity_id, contact_id, assigned_to,
        created_by, created_at, updated_at, is_deleted
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), FALSE)
      RETURNING *
    `;

    const values = [
      subject,
      description,
      due_date,
      priority || 'Medium',
      status || 'Not Started',
      customer_id,
      opportunity_id,
      contact_id,
      assigned_to || req.user.user_id, // Use current user if not specified
      req.user.user_id // created_by
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
      subject,
      description,
      due_date,
      priority,
      status,
      customer_id,
      opportunity_id,
      contact_id,
      assigned_to
    } = req.body;

    const query = `
      UPDATE task SET
        subject = COALESCE($1, subject),
        description = COALESCE($2, description),
        due_date = COALESCE($3, due_date),
        priority = COALESCE($4, priority),
        status = COALESCE($5, status),
        customer_id = COALESCE($6, customer_id),
        opportunity_id = COALESCE($7, opportunity_id),
        contact_id = COALESCE($8, contact_id),
        assigned_to = COALESCE($9, assigned_to),
        updated_at = NOW(),
        updated_by = $10
      WHERE task_id = $11 AND is_deleted = false
      RETURNING *
    `;

    const values = [
      subject, description, due_date, priority, status,
      customer_id, opportunity_id, contact_id, assigned_to,
      req.user.user_id, // updated_by
      id
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

// PATCH archive task (soft delete / archive)
router.patch('/:id/archive', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE task
      SET is_deleted = true, updated_at = NOW()
      WHERE task_id = $1 AND is_deleted = false
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or already archived' });
    }

    res.json({ message: 'Task archived successfully', task: result.rows[0] });
  } catch (error) {
    console.error('Error archiving task:', error);
    res.status(500).json({ error: 'Failed to archive task', message: error.message });
  }
});

// GET archived tasks
router.get('/archived/list', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const query = `
      SELECT
        t.*,
        c.company_name,
        con.first_name || ' ' || con.last_name as contact_name
      FROM task t
      LEFT JOIN customer c ON t.customer_id = c.customer_id
      LEFT JOIN contact con ON t.contact_id = con.contact_id
      WHERE t.is_deleted = true
      ORDER BY t.updated_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM task WHERE is_deleted = true`;
    const countResult = await pool.query(countQuery);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      tasks: result.rows,
      total: totalCount,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching archived tasks:', error);
    res.status(500).json({ error: 'Failed to fetch archived tasks', message: error.message });
  }
});

// PATCH restore archived task
router.patch('/:id/restore', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE task
      SET is_deleted = false, updated_at = NOW()
      WHERE task_id = $1 AND is_deleted = true
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Archived task not found' });
    }

    res.json({ message: 'Task restored successfully', task: result.rows[0] });
  } catch (error) {
    console.error('Error restoring task:', error);
    res.status(500).json({ error: 'Failed to restore task', message: error.message });
  }
});

// DELETE task permanently (hard delete)
router.delete('/:id/permanent', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Only allow permanent delete of already archived tasks
    const checkQuery = `SELECT is_deleted FROM task WHERE task_id = $1`;
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (!checkResult.rows[0].is_deleted) {
      return res.status(400).json({ error: 'Task must be archived before permanent deletion' });
    }

    const deleteQuery = `DELETE FROM task WHERE task_id = $1 RETURNING *`;
    const result = await pool.query(deleteQuery, [id]);

    res.json({ message: 'Task permanently deleted', task: result.rows[0] });
  } catch (error) {
    console.error('Error permanently deleting task:', error);
    res.status(500).json({ error: 'Failed to permanently delete task', message: error.message });
  }
});

// DELETE task (legacy soft delete - kept for backward compatibility)
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

    res.json({ message: 'Task archived successfully', task: result.rows[0] });
  } catch (error) {
    console.error('Error archiving task:', error);
    res.status(500).json({ error: 'Failed to archive task', message: error.message });
  }
});

module.exports = router;
