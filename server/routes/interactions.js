const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const {
  syncInteractionToCalendar,
  removeInteractionCalendar,
  shouldSyncInteraction
} = require('../services/calendar-sync');

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
    let whereConditions = ['i.archived = FALSE'];

    if (search) {
      whereConditions.push(`(
        i.subject ILIKE $${queryParams.length + 1} OR
        i.description ILIKE $${queryParams.length + 1} OR
        c.company_name ILIKE $${queryParams.length + 1}
      )`);
      queryParams.push(`%${search}%`);
    }

    query += ' WHERE ' + whereConditions.join(' AND ');

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

// GET past interactions (before current time)
// NOTE: This must come BEFORE /:id route to avoid matching "past" as an ID
router.get('/past', authenticateToken, async (req, res) => {
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
    let whereConditions = ['i.interaction_date < NOW()', 'i.archived = FALSE'];

    if (search) {
      whereConditions.push(`(
        i.subject ILIKE $${queryParams.length + 1} OR
        i.description ILIKE $${queryParams.length + 1} OR
        c.company_name ILIKE $${queryParams.length + 1}
      )`);
      queryParams.push(`%${search}%`);
    }

    query += ' WHERE ' + whereConditions.join(' AND ');
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
    console.error('Error fetching past interactions:', error);
    res.status(500).json({ error: 'Failed to fetch past interactions', message: error.message });
  }
});

// GET future interactions (at or after current time)
router.get('/future', authenticateToken, async (req, res) => {
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
    let whereConditions = ['i.interaction_date >= NOW()', 'i.archived = FALSE'];

    if (search) {
      whereConditions.push(`(
        i.subject ILIKE $${queryParams.length + 1} OR
        i.description ILIKE $${queryParams.length + 1} OR
        c.company_name ILIKE $${queryParams.length + 1}
      )`);
      queryParams.push(`%${search}%`);
    }

    query += ' WHERE ' + whereConditions.join(' AND ');
    query += ` ORDER BY i.interaction_date ASC`;

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
    console.error('Error fetching future interactions:', error);
    res.status(500).json({ error: 'Failed to fetch future interactions', message: error.message });
  }
});

// GET single interaction by ID
// NOTE: This must come AFTER /past and /future routes
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        i.*,
        c.company_name,
        con.first_name || ' ' || con.last_name as contact_name
      FROM interaction i
      LEFT JOIN customer c ON i.customer_id = c.customer_id
      LEFT JOIN contact con ON i.contact_id = con.contact_id
      WHERE i.interaction_id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Interaction not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching interaction:', error);
    res.status(500).json({ error: 'Failed to fetch interaction', message: error.message });
  }
});

// GET interactions for a specific customer
router.get('/customer/:customerId', authenticateToken, async (req, res) => {
  try {
    const { customerId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const query = `
      SELECT
        i.*,
        c.company_name,
        con.first_name || ' ' || con.last_name as contact_name
      FROM interaction i
      LEFT JOIN customer c ON i.customer_id = c.customer_id
      LEFT JOIN contact con ON i.contact_id = con.contact_id
      WHERE i.customer_id = $1
      ORDER BY i.interaction_date DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [customerId, limit, offset]);

    const countQuery = `
      SELECT COUNT(*) FROM interaction
      WHERE customer_id = $1
    `;
    const countResult = await pool.query(countQuery, [customerId]);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      interactions: result.rows,
      total: totalCount,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching customer interactions:', error);
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

    //Convert importance string to integer if needed
    let importanceValue = importance;
    if (typeof importance === 'string') {
      const importanceMap = { 'low': 1, 'medium': 2, 'high': 3 };
      importanceValue = importanceMap[importance.toLowerCase()] || null;
    }

    const query = `
      INSERT INTO interaction (
        interaction_type, subject, description, interaction_date,
        customer_id, contact_id, duration_minutes, direction,
        medium, outcome, sentiment, importance, location, private_notes,
        created_by, updated_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;

    const values = [
      interaction_type, subject, description, interaction_date,
      customer_id, contact_id, duration_minutes, direction,
      medium, outcome, sentiment, importanceValue, location, private_notes,
      req.user.user_id, // created_by
      req.user.user_id  // updated_by
    ];

    const result = await pool.query(query, values);
    const interaction = result.rows[0];

    let calendarSync = { skipped: true, reason: 'Does not meet sync criteria' };
    try {
      if (shouldSyncInteraction(interaction)) {
        calendarSync = await syncInteractionToCalendar(interaction, req.user.user_id);
      }
    } catch (syncError) {
      console.error('Calendar sync failed after interaction create:', syncError);
      calendarSync = {
        success: false,
        error: syncError.message
      };
    }

    res.status(201).json({
      ...interaction,
      calendar_sync: calendarSync
    });
  } catch (error) {
    console.error('Error creating interaction:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      table: error.table,
      constraint: error.constraint
    });
    res.status(500).json({
      error: 'Failed to create interaction',
      message: error.message,
      detail: error.detail || error.message
    });
  }
});

// PUT update interaction
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
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

    // Convert importance string to integer if needed
    let importanceValue = importance;
    if (typeof importance === 'string') {
      const importanceMap = { 'low': 1, 'medium': 2, 'high': 3 };
      importanceValue = importanceMap[importance.toLowerCase()] || null;
    }

    const query = `
      UPDATE interaction SET
        interaction_type = COALESCE($1, interaction_type),
        subject = COALESCE($2, subject),
        description = COALESCE($3, description),
        interaction_date = COALESCE($4, interaction_date),
        customer_id = COALESCE($5, customer_id),
        contact_id = COALESCE($6, contact_id),
        duration_minutes = COALESCE($7, duration_minutes),
        direction = COALESCE($8, direction),
        medium = COALESCE($9, medium),
        outcome = COALESCE($10, outcome),
        sentiment = COALESCE($11, sentiment),
        importance = COALESCE($12, importance),
        location = COALESCE($13, location),
        private_notes = COALESCE($14, private_notes),
        updated_at = NOW(),
        updated_by = $15
      WHERE interaction_id = $16
      RETURNING *
    `;

    const values = [
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
      importanceValue,
      location,
      private_notes,
      req.user.user_id, // updated_by
      id
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Interaction not found' });
    }

    const interaction = result.rows[0];

    let calendarSync = null;
    try {
      if (shouldSyncInteraction(interaction)) {
        calendarSync = await syncInteractionToCalendar(interaction, req.user.user_id);
      } else {
        const removalReason = interaction.archived ? 'archived' : 'unscheduled';
        calendarSync = await removeInteractionCalendar(interaction.interaction_id, req.user.user_id, removalReason);
      }
    } catch (syncError) {
      console.error('Calendar sync failed after interaction update:', syncError);
      calendarSync = {
        success: false,
        error: syncError.message
      };
    }

    res.json({
      ...interaction,
      calendar_sync: calendarSync
    });
  } catch (error) {
    console.error('Error updating interaction:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      table: error.table,
      constraint: error.constraint
    });
    res.status(500).json({
      error: 'Failed to update interaction',
      message: error.message,
      detail: error.detail || error.message
    });
  }
});

// PATCH archive interaction (soft delete)
router.patch('/:id/archive', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE interaction
      SET archived = TRUE, updated_at = NOW(), updated_by = $1
      WHERE interaction_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [req.user.user_id, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Interaction not found' });
    }

    res.json({ message: 'Interaction archived successfully', interaction: result.rows[0] });
  } catch (error) {
    console.error('Error archiving interaction:', error);
    res.status(500).json({ error: 'Failed to archive interaction', message: error.message });
  }
});

// PATCH unarchive interaction
router.patch('/:id/unarchive', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE interaction
      SET archived = FALSE, updated_at = NOW(), updated_by = $1
      WHERE interaction_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [req.user.user_id, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Interaction not found' });
    }

    res.json({ message: 'Interaction unarchived successfully', interaction: result.rows[0] });
  } catch (error) {
    console.error('Error unarchiving interaction:', error);
    res.status(500).json({ error: 'Failed to unarchive interaction', message: error.message });
  }
});

// GET archived interactions
router.get('/archived/list', authenticateToken, async (req, res) => {
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
    let whereConditions = ['i.archived = TRUE'];

    if (search) {
      whereConditions.push(`(
        i.subject ILIKE $${queryParams.length + 1} OR
        i.description ILIKE $${queryParams.length + 1} OR
        c.company_name ILIKE $${queryParams.length + 1}
      )`);
      queryParams.push(`%${search}%`);
    }

    query += ' WHERE ' + whereConditions.join(' AND ');
    query += ` ORDER BY i.updated_at DESC`;

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
    console.error('Error fetching archived interactions:', error);
    res.status(500).json({ error: 'Failed to fetch archived interactions', message: error.message });
  }
});

// DELETE interaction (only from archive)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if interaction is archived before allowing deletion
    const checkQuery = `SELECT archived FROM interaction WHERE interaction_id = $1`;
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Interaction not found' });
    }

    if (!checkResult.rows[0].archived) {
      return res.status(400).json({
        error: 'Cannot delete active interaction',
        message: 'Please archive the interaction first before deleting'
      });
    }

    const query = `
      DELETE FROM interaction
      WHERE interaction_id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    let calendarSync = null;
    try {
      calendarSync = await removeInteractionCalendar(id, req.user.user_id, 'deleted');
    } catch (syncError) {
      console.error('Calendar sync failed after interaction delete:', syncError);
      calendarSync = {
        success: false,
        error: syncError.message
      };
    }

    res.json({
      message: 'Interaction deleted permanently',
      interaction: result.rows[0],
      calendar_sync: calendarSync
    });
  } catch (error) {
    console.error('Error deleting interaction:', error);
    res.status(500).json({ error: 'Failed to delete interaction', message: error.message });
  }
});

module.exports = router;
