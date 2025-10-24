const express = require('express');
const router = express.Router();
const pool = require('../db');
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');

// Helper function to trigger MIA pipeline auto-refresh
async function triggerAutoRefresh(companyName) {
  try {
    const response = await axios.post('http://localhost:3002/api/mia-pipeline/auto-refresh', {
      companies: [companyName],
      source: 'customer_creation'
    });

    console.log(`[Auto-refresh] Triggered MIA pipeline for company: ${companyName}, Job ID: ${response.data.jobId}`);
    return response.data;
  } catch (error) {
    console.error(`[Auto-refresh] Failed to trigger MIA pipeline for company: ${companyName}`, error.message);
    // Don't throw error - we don't want customer creation to fail if MIA pipeline fails
    return null;
  }
}

// GET all customers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, limit = 100, offset = 0 } = req.query;

    let query = `
      SELECT
        c.*,
        i.industry_name,
        cu.code as currency_code,
        cu.symbol as currency_symbol,
        (SELECT COUNT(*) FROM contact WHERE customer_id = c.customer_id AND is_active = true) as contact_count,
        (SELECT COUNT(*) FROM opportunity WHERE customer_id = c.customer_id) as opportunity_count
      FROM customer c
      LEFT JOIN industry i ON c.industry_code = i.industry_code
      LEFT JOIN currency cu ON c.currency_id = cu.currency_id
      WHERE c.is_active = true
    `;

    const queryParams = [];

    if (search) {
      query += ` AND (
        c.company_name ILIKE $1 OR
        c.description ILIKE $1 OR
        i.industry_name ILIKE $1
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
      customers: result.rows,
      total: totalCount,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers', message: error.message });
  }
});

// GET single customer by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        c.*,
        i.industry_name,
        cu.code as currency_code,
        cu.symbol as currency_symbol
      FROM customer c
      LEFT JOIN industry i ON c.industry_code = i.industry_code
      LEFT JOIN currency cu ON c.currency_id = cu.currency_id
      WHERE c.customer_id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer', message: error.message });
  }
});

function inferRegionFromCountry(country) {
  if (!country) return null;

  const normalized = country.trim().toLowerCase();

  if (['china', 'cn', 'japan', 'jp', 'south korea', 'kr', 'singapore', 'sg', 'hong kong', 'hk', 'india', 'in', 'australia', 'au'].includes(normalized)) {
    return 'APAC';
  }

  if (['united states', 'us', 'usa', 'canada', 'ca'].includes(normalized)) {
    return 'NA';
  }

  if (['united kingdom', 'uk', 'gb', 'great britain', 'germany', 'de', 'france', 'fr', 'europe', 'eu'].includes(normalized)) {
    return 'EMEA';
  }

  return 'GLOBAL';
}

// POST create new customer
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      company_name,
      industry_code,
      industry_name,
      listing_status,
      website,
      description,
      introduction,
      phone,
      email,
      address_line1,
      address_line2,
      city,
      state_province,
      postal_code,
      country,
      region,
      customer_type,
      status,
      owner_user_id,
      employee_count_range,
      custom_fields,
      customFields
    } = req.body;

    if (!company_name || !company_name.trim()) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const resolvedOwnerUserId = owner_user_id || req.user?.user_id || null;
    const resolvedRegion = region || inferRegionFromCountry(country);
    const customerStatus = status || 'active';
    const customerType = customer_type || 'prospect';

    let customFieldsPayload = null;
    const rawCustomFields = custom_fields ?? customFields;
    if (rawCustomFields !== undefined) {
      if (typeof rawCustomFields === 'string') {
        try {
          customFieldsPayload = JSON.parse(rawCustomFields);
        } catch (parseError) {
          console.warn('[Customer Create] Failed to parse custom fields string, storing raw string');
          customFieldsPayload = { raw: rawCustomFields };
        }
      } else {
        customFieldsPayload = rawCustomFields;
      }
    }

    // Handle industry: create if custom industry name is provided
    let resolvedIndustryCode = industry_code;
    if (industry_name && !industry_code) {
      // Check if industry exists
      const industryCheck = await pool.query(
        'SELECT industry_code FROM industry WHERE LOWER(industry_name) = LOWER($1)',
        [industry_name]
      );

      if (industryCheck.rows.length > 0) {
        resolvedIndustryCode = industryCheck.rows[0].industry_code;
      } else {
        // Create new industry
        const newIndustryCode = industry_name.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 20);
        try {
          const industryInsert = await pool.query(
            'INSERT INTO industry (industry_code, industry_name) VALUES ($1, $2) RETURNING industry_code',
            [newIndustryCode, industry_name]
          );
          resolvedIndustryCode = industryInsert.rows[0].industry_code;
        } catch (err) {
          // If insert fails due to duplicate key, try to fetch again
          if (err.code === '23505') {
            const retryCheck = await pool.query(
              'SELECT industry_code FROM industry WHERE industry_name = $1',
              [industry_name]
            );
            resolvedIndustryCode = retryCheck.rows[0]?.industry_code || null;
          } else {
            throw err;
          }
        }
      }
    }

    const query = `
      INSERT INTO customer (
        company_name,
        industry_code,
        listing_status,
        website,
        description,
        introduction,
        phone,
        email,
        address_line1,
        address_line2,
        city,
        state_province,
        postal_code,
        country,
        region,
        customer_type,
        status,
        owner_user_id,
        employee_count_range,
        custom_fields
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20
      )
      RETURNING *
    `;

    const values = [
      company_name.trim(),
      resolvedIndustryCode || null,
      listing_status || null,
      website || null,
      description || null,
      introduction || null,
      phone || null,
      email || null,
      address_line1 || null,
      address_line2 || null,
      city || null,
      state_province || null,
      postal_code || null,
      country || null,
      resolvedRegion || null,
      customerType,
      customerStatus,
      resolvedOwnerUserId,
      employee_count_range || null,
      customFieldsPayload
    ];

    const result = await pool.query(query, values);
    const newCustomer = result.rows[0];

    // Trigger MIA pipeline auto-refresh for the new company
    if (company_name && company_name.trim()) {
      console.log(`[Customer Created] Triggering auto-refresh for company: ${company_name}`);

      // Trigger auto-refresh asynchronously (don't wait for completion)
      triggerAutoRefresh(company_name.trim()).then((refreshResult) => {
        if (refreshResult) {
          console.log(`[Auto-refresh] Successfully triggered for ${company_name}, Job ID: ${refreshResult.jobId}`);
        } else {
          console.log(`[Auto-refresh] Failed to trigger for ${company_name}`);
        }
      }).catch((error) => {
        console.error(`[Auto-refresh] Error triggering for ${company_name}:`, error);
      });
    }

    res.status(201).json({
      ...newCustomer,
      autoRefreshTriggered: !!company_name?.trim()
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer', message: error.message });
  }
});

// PUT update customer
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company_name,
      industry_code,
      website,
      description,
      phone,
      email,
      customer_type,
      status,
      address_line1,
      address_line2,
      city,
      state_province,
      postal_code,
      country
    } = req.body;

    const query = `
      UPDATE customer SET
        company_name = COALESCE($1, company_name),
        industry_code = COALESCE($2, industry_code),
        website = COALESCE($3, website),
        description = COALESCE($4, description),
        phone = COALESCE($5, phone),
        email = COALESCE($6, email),
        customer_type = COALESCE($7, customer_type),
        status = COALESCE($8, status),
        address_line1 = COALESCE($9, address_line1),
        address_line2 = COALESCE($10, address_line2),
        city = COALESCE($11, city),
        state_province = COALESCE($12, state_province),
        postal_code = COALESCE($13, postal_code),
        country = COALESCE($14, country),
        updated_at = NOW(),
        updated_by = $16
      WHERE customer_id = $15
      RETURNING *
    `;

    const values = [
      company_name, industry_code, website, description,
      phone, email, customer_type, status, address_line1, address_line2,
      city, state_province, postal_code, country, id, req.user?.user_id || null
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer', message: error.message });
  }
});

// DELETE customer (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE customer
      SET is_active = false, updated_at = NOW()
      WHERE customer_id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully', customer: result.rows[0] });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer', message: error.message });
  }
});

module.exports = router;
