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
    const currencies = await pool.query('SELECT * FROM currency ORDER BY code');
    currencies.rows.forEach(currency => {
      console.log(`${currency.currency_id}: ${currency.code}`);
    });

    console.log('\n=== REGION TABLE STRUCTURE ===');
    const regionSchema = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'region'
      ORDER BY ordinal_position;
    `);
    regionSchema.rows.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type}`);
    });

    console.log('\n=== REGION TABLE DATA ===');
    const regions = await pool.query('SELECT * FROM region LIMIT 10');
    regions.rows.forEach(region => {
      console.log(JSON.stringify(region, null, 2));
    });

    console.log('\n=== CUSTOMERS FOR OPPORTUNITIES ===');
    const customers = await pool.query(`
      SELECT customer_id, company_name, industry_code, country_code
      FROM customer
      WHERE created_at >= '2025-10-10'  -- New customers we created
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