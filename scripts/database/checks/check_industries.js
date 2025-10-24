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

async function checkIndustries() {
  try {
    const result = await pool.query('SELECT * FROM industry ORDER BY industry_name');
    
    console.log('Current industries in database:');
    console.log('Count:', result.rows.length);
    result.rows.forEach(row => {
      console.log(`  ${row.industry_code}: ${row.industry_name}`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkIndustries();
