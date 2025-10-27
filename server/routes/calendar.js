const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET calendar events for a date range
router.get('/events', authenticateToken, async (req, res) => {
  try {
    const { start, end, view = 'month' } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }

    // Fetch interactions within the date range
    const interactionsQuery = `
      SELECT
        i.interaction_id as id,
        i.subject as title,
        i.description,
        i.interaction_date,
        i.start_time,
        i.end_time,
        i.duration_minutes,
        i.location,
        i.interaction_type as type,
        i.medium,
        i.outcome,
        i.sentiment,
        i.importance,
        c.company_name as customer_name,
        c.customer_id,
        con.first_name || ' ' || con.last_name as contact_name,
        con.contact_id,
        'interaction' as source_type
      FROM interaction i
      LEFT JOIN customer c ON i.customer_id = c.customer_id
      LEFT JOIN contact con ON i.contact_id = con.contact_id
      WHERE
        i.archived = FALSE
        AND i.interaction_date IS NOT NULL
        AND i.interaction_date >= $1::timestamp
        AND i.interaction_date < $2::timestamp
      ORDER BY i.interaction_date, i.start_time
    `;

    // Fetch tasks within the date range
    const tasksQuery = `
      SELECT
        t.task_id as id,
        t.subject as title,
        t.description,
        t.due_date,
        t.priority,
        t.status,
        c.company_name as customer_name,
        c.customer_id,
        con.first_name || ' ' || con.last_name as contact_name,
        con.contact_id,
        'task' as source_type
      FROM task t
      LEFT JOIN customer c ON t.customer_id = c.customer_id
      LEFT JOIN contact con ON t.contact_id = con.contact_id
      WHERE
        t.is_deleted = FALSE
        AND t.due_date IS NOT NULL
        AND DATE(t.due_date) >= DATE($1::timestamp)
        AND DATE(t.due_date) <= DATE($2::timestamp)
      ORDER BY t.due_date
    `;

    const [interactionsResult, tasksResult] = await Promise.all([
      pool.query(interactionsQuery, [start, end]),
      pool.query(tasksQuery, [start, end])
    ]);

    // Format interactions for calendar display
    const interactionEvents = interactionsResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      date: row.interaction_date,
      startTime: row.start_time,
      endTime: row.end_time,
      duration: row.duration_minutes,
      location: row.location,
      type: row.type,
      medium: row.medium,
      outcome: row.outcome,
      sentiment: row.sentiment,
      importance: row.importance,
      customer: row.customer_name ? {
        id: row.customer_id,
        name: row.customer_name
      } : null,
      contact: row.contact_name ? {
        id: row.contact_id,
        name: row.contact_name
      } : null,
      sourceType: row.source_type,
      relatedId: row.id,
      relatedTable: 'interaction'
    }));

    // Format tasks for calendar display
    const taskEvents = tasksResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      date: row.due_date,
      priority: row.priority,
      status: row.status,
      customer: row.customer_name ? {
        id: row.customer_id,
        name: row.customer_name
      } : null,
      contact: row.contact_name ? {
        id: row.contact_id,
        name: row.contact_name
      } : null,
      sourceType: row.source_type,
      relatedId: row.id,
      relatedTable: 'task'
    }));

    // Combine and sort all events
    const allEvents = [...interactionEvents, ...taskEvents].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }
      // If dates are the same, interactions with time come before tasks
      if (a.startTime && !b.startTime) return -1;
      if (!a.startTime && b.startTime) return 1;
      return 0;
    });

    res.json({
      events: allEvents,
      count: allEvents.length,
      view,
      dateRange: { start, end }
    });

  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({
      error: 'Failed to fetch calendar events',
      message: error.message
    });
  }
});

// GET events for a specific day
router.get('/events/day/:date', authenticateToken, async (req, res) => {
  try {
    const { date } = req.params;

    const query = `
      SELECT
        i.interaction_id as id,
        i.subject as title,
        i.description,
        i.interaction_date,
        i.start_time,
        i.end_time,
        i.duration_minutes,
        i.location,
        i.interaction_type as type,
        i.medium,
        i.outcome,
        i.sentiment,
        i.importance,
        c.company_name as customer_name,
        c.customer_id,
        con.first_name || ' ' || con.last_name as contact_name,
        'interaction' as source_type
      FROM interaction i
      LEFT JOIN customer c ON i.customer_id = c.customer_id
      LEFT JOIN contact con ON i.contact_id = con.contact_id
      WHERE
        i.archived = FALSE
        AND DATE(i.interaction_date) = $1::date
      ORDER BY i.start_time
    `;

    const result = await pool.query(query, [date]);

    const events = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      date: row.interaction_date,
      startTime: row.start_time,
      endTime: row.end_time,
      duration: row.duration_minutes,
      location: row.location,
      type: row.type,
      medium: row.medium,
      outcome: row.outcome,
      sentiment: row.sentiment,
      importance: row.importance,
      customer: row.customer_name ? {
        id: row.customer_id,
        name: row.customer_name
      } : null,
      contact: row.contact_name,
      sourceType: row.source_type,
      relatedId: row.id,
      relatedTable: 'interaction'
    }));

    res.json({
      date,
      events,
      count: events.length
    });

  } catch (error) {
    console.error('Error fetching day events:', error);
    res.status(500).json({
      error: 'Failed to fetch day events',
      message: error.message
    });
  }
});

// GET event statistics for date range
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }

    const query = `
      SELECT
        COUNT(*) as total_events,
        COUNT(DISTINCT customer_id) as unique_customers,
        SUM(duration_minutes) as total_duration,
        interaction_type,
        COUNT(*) as type_count
      FROM interaction
      WHERE
        archived = FALSE
        AND interaction_date >= $1::timestamp
        AND interaction_date < $2::timestamp
      GROUP BY interaction_type
    `;

    const result = await pool.query(query, [start, end]);

    res.json({
      statistics: result.rows,
      dateRange: { start, end }
    });

  } catch (error) {
    console.error('Error fetching calendar stats:', error);
    res.status(500).json({
      error: 'Failed to fetch calendar statistics',
      message: error.message
    });
  }
});

module.exports = router;
