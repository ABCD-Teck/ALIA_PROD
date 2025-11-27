const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE_ALIA,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    console.log('Running financial_statement table migration...\n');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'server', 'migrations', 'create_financial_statement_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing migration: create_financial_statement_table.sql\n');

    // Execute the migration
    await pool.query(sql);

    console.log('✓ Migration completed successfully!\n');
    console.log('Created table: financial_statement');

  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    await pool.end();
  }
}

runMigration();
