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

async function checkReferenceTables() {
  try {
    console.log('=== CURRENCY TABLE ===');
    const currencies = await pool.query('SELECT * FROM currency ORDER BY name');
    currencies.rows.forEach(currency => {
      console.log(`${currency.currency_id}: ${currency.name} (${currency.code})`);
    });

    console.log('\n=== REGION TABLE ===');
    const regions = await pool.query('SELECT * FROM region ORDER BY name');
    regions.rows.forEach(region => {
      console.log(`${region.region_id}: ${region.name} (${region.code})`);
    });

    console.log('\n=== STAGE OPTIONS ===');
    const stages = await pool.query(`
      SELECT DISTINCT stage FROM opportunity
      WHERE stage IS NOT NULL
      UNION
      SELECT 'DISCOVERY' as stage
      UNION
      SELECT 'NEGOTIATION' as stage
      UNION
      SELECT 'CLOSED_WON' as stage
      UNION
      SELECT 'CLOSED_LOST' as stage
    `);
    stages.rows.forEach(stage => {
      console.log(`- ${stage.stage}`);
    });

    console.log('\n=== PRIORITY OPTIONS ===');
    const priorities = await pool.query(`
      SELECT DISTINCT priority FROM opportunity
      WHERE priority IS NOT NULL
    `);
    priorities.rows.forEach(priority => {
      console.log(`- ${priority.priority}`);
    });

    console.log('\n=== CUSTOMERS FOR OPPORTUNITIES ===');
    const customers = await pool.query(`
      SELECT customer_id, company_name, industry_code, country_code
      FROM customer
      WHERE customer_id IN (
        SELECT DISTINCT customer_id FROM customer
        WHERE created_at >= '2025-10-10'  -- New customers we created
      )
      ORDER BY company_name
    `);
    customers.rows.forEach(customer => {
      console.log(`${customer.customer_id}: ${customer.company_name} (${customer.industry_code}, ${customer.country_code})`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkReferenceTables();