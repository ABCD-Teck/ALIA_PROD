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

async function checkOpportunitySchema() {
  try {
    // Get table information
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'opportunity'
      ORDER BY ordinal_position;
    `);

    console.log('=== OPPORTUNITY TABLE SCHEMA ===');
    tableInfo.rows.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    console.log('\n=== SAMPLE OPPORTUNITY DATA ===');
    const sample = await pool.query('SELECT * FROM opportunity LIMIT 3');
    console.log('Found', sample.rows.length, 'opportunities');
    sample.rows.forEach((opp, i) => {
      console.log(`\nOpportunity ${i+1}:`);
      console.log(JSON.stringify(opp, null, 2));
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkOpportunitySchema();