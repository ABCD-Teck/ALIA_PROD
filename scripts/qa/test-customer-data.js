require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE_ALIA,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testCustomerData() {
  try {
    // Get interactions table schema
    console.log('=== INTERACTIONS TABLE SCHEMA ===');
    const schemaQuery = `
      SELECT
        column_name,
        data_type,
        character_maximum_length,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'interaction'
      ORDER BY ordinal_position;
    `;
    const schemaResult = await pool.query(schemaQuery);
    console.table(schemaResult.rows);

    // Get sample interactions
    console.log('\n=== SAMPLE INTERACTIONS (Latest 5) ===');
    const sampleQuery = `
      SELECT
        i.interaction_id,
        i.interaction_type,
        i.subject,
        i.interaction_date,
        i.medium,
        i.outcome,
        c.company_name,
        cont.first_name || ' ' || cont.last_name as contact_name
      FROM interaction i
      LEFT JOIN customer c ON i.customer_id = c.customer_id
      LEFT JOIN contact cont ON i.contact_id = cont.contact_id
      ORDER BY i.interaction_date DESC
      LIMIT 5;
    `;
    const sampleResult = await pool.query(sampleQuery);
    console.table(sampleResult.rows);

    // Get interaction statistics
    console.log('\n=== INTERACTION STATISTICS ===');
    const statsQuery = `
      SELECT
        interaction_type,
        COUNT(*) as count,
        ROUND(AVG(duration_minutes)::numeric, 2) as avg_duration
      FROM interaction
      GROUP BY interaction_type
      ORDER BY count DESC;
    `;
    const statsResult = await pool.query(statsQuery);
    console.table(statsResult.rows);

    // Get interactions by outcome
    console.log('\n=== INTERACTIONS BY OUTCOME ===');
    const outcomeQuery = `
      SELECT
        outcome,
        COUNT(*) as count
      FROM interaction
      WHERE outcome IS NOT NULL
      GROUP BY outcome
      ORDER BY count DESC;
    `;
    const outcomeResult = await pool.query(outcomeQuery);
    console.table(outcomeResult.rows);

    // Get total count
    console.log('\n=== TOTAL INTERACTION COUNT ===');
    const countQuery = `SELECT COUNT(*) as total FROM interaction;`;
    const countResult = await pool.query(countQuery);
    console.table(countResult.rows);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

testCustomerData();
