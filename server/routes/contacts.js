const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET all contacts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, limit = 10, offset = 0 } = req.query;

    let query = `
      SELECT
        c.*,
        cu.company_name,
        cu.website
      FROM contact c
      LEFT JOIN customer cu ON c.customer_id = cu.customer_id
      WHERE c.is_active = true
    `;

    const queryParams = [];

    if (search) {
      query += ` AND (
        c.first_name ILIKE $1 OR
        c.last_name ILIKE $1 OR
        c.email ILIKE $1 OR
        c.phone ILIKE $1 OR
        cu.company_name ILIKE $1
      )`;
      queryParams.push(`%${search}%`);
    }

    query += ` ORDER BY c.created_at DESC`;

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
    const countResult = await pool.query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    res.json({
      contacts: result.rows,
      total: totalCount,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts', message: error.message });
  }
});

// GET single contact by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        c.*,
        cu.company_name,
        cu.website,
        cu.industry_code,
        cu.phone as customer_phone,
        cu.email as customer_email
      FROM contact c
      LEFT JOIN customer cu ON c.customer_id = cu.customer_id
      WHERE c.contact_id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Failed to fetch contact', message: error.message });
  }
});

// POST create new contact
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      customer_id,
      first_name,
      last_name,
      phone,
      email,
      job_title,
      department,
      mobile,
      linkedin_url,
      is_primary,
      preferred_communication,
      address_line1,
      address_line2,
      city,
      state_province,
      postal_code,
      country,
      notes,
      tags,
      source
    } = req.body;

    const query = `
      INSERT INTO contact (
        customer_id, first_name, last_name, phone, email,
        job_title, department, mobile, linkedin_url, is_primary,
        preferred_communication, address_line1, address_line2, city,
        state_province, postal_code, country, notes, tags, source
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *
    `;

    const values = [
      customer_id, first_name, last_name, phone, email,
      job_title, department, mobile, linkedin_url, is_primary || false,
      preferred_communication || 'email', address_line1, address_line2, city,
      state_province, postal_code, country, notes, tags, source
    ];

    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Failed to create contact', message: error.message });
  }
});

// PUT update contact
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      phone,
      email,
      job_title,
      department,
      mobile,
      linkedin_url,
      is_primary,
      preferred_communication,
      address_line1,
      address_line2,
      city,
      state_province,
      postal_code,
      country,
      notes,
      tags,
      source
    } = req.body;

    const query = `
      UPDATE contact SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        phone = COALESCE($3, phone),
        email = COALESCE($4, email),
        job_title = COALESCE($5, job_title),
        department = COALESCE($6, department),
        mobile = COALESCE($7, mobile),
        linkedin_url = COALESCE($8, linkedin_url),
        is_primary = COALESCE($9, is_primary),
        preferred_communication = COALESCE($10, preferred_communication),
        address_line1 = COALESCE($11, address_line1),
        address_line2 = COALESCE($12, address_line2),
        city = COALESCE($13, city),
        state_province = COALESCE($14, state_province),
        postal_code = COALESCE($15, postal_code),
        country = COALESCE($16, country),
        notes = COALESCE($17, notes),
        tags = COALESCE($18, tags),
        source = COALESCE($19, source),
        updated_at = NOW()
      WHERE contact_id = $20
      RETURNING *
    `;

    const values = [
      first_name, last_name, phone, email, job_title,
      department, mobile, linkedin_url, is_primary, preferred_communication,
      address_line1, address_line2, city, state_province, postal_code,
      country, notes, tags, source, id
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact', message: error.message });
  }
});

// DELETE contact (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE contact
      SET is_active = false, updated_at = NOW()
      WHERE contact_id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ message: 'Contact deleted successfully', contact: result.rows[0] });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact', message: error.message });
  }
});

module.exports = router;
