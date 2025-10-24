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

async function checkConstraints() {
  try {
    console.log('=== EXISTING OPPORTUNITY VALUES ===');
    const existing = await pool.query('SELECT stage, priority FROM opportunity');
    existing.rows.forEach(opp => {
      console.log(`Stage: ${opp.stage}, Priority: ${opp.priority}`);
    });

    console.log('\n=== TABLE CONSTRAINTS ===');
    const constraints = await pool.query(`
      SELECT conname, consrc
      FROM pg_constraint
      WHERE conrelid = 'opportunity'::regclass
      AND contype = 'c'
    `);
    constraints.rows.forEach(constraint => {
      console.log(`${constraint.conname}: ${constraint.consrc}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkConstraints();