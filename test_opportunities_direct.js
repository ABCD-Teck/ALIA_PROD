const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE_ALIA,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function testOpportunityQuery() {
  try {
    console.log('=== TESTING OPPORTUNITY QUERIES ===');

    // First, simple query
    const simpleQuery = `SELECT COUNT(*) FROM opportunity`;
    const simple = await pool.query(simpleQuery);
    console.log('Simple count:', simple.rows[0].count);

    // Test our updated query
    const testQuery = `
      SELECT
        o.*,
        c.company_name,
        cu.code as currency_code
      FROM opportunity o
      LEFT JOIN customer c ON o.customer_id = c.customer_id
      LEFT JOIN currency cu ON o.currency_id = cu.currency_id
      WHERE 1=1
      ORDER BY o.created_at DESC
      LIMIT 3
    `;

    const result = await pool.query(testQuery);
    console.log('\n=== OPPORTUNITIES ===');
    result.rows.forEach((opp, i) => {
      console.log(`\nOpportunity ${i+1}:`);
      console.log(`- ID: ${opp.opportunity_id}`);
      console.log(`- Name: ${opp.name}`);
      console.log(`- Company: ${opp.company_name}`);
      console.log(`- Amount: ${opp.amount} ${opp.currency_code}`);
      console.log(`- Stage: ${opp.stage}`);
      console.log(`- Priority: ${opp.priority}`);
      console.log(`- Expected Close: ${opp.expected_close_date}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testOpportunityQuery();