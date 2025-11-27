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

async function checkSchema() {
  try {
    console.log('Checking financial_statement table schema...\n');

    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'financial_statement'
      );
    `);

    console.log('Table exists:', tableCheck.rows[0].exists);

    if (tableCheck.rows[0].exists) {
      // Get column information
      const columnsQuery = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'financial_statement'
        ORDER BY ordinal_position;
      `);

      console.log('\nColumns in financial_statement table:');
      columnsQuery.rows.forEach(row => {
        console.log(`  - ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
      });
    }

  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    await pool.end();
  }
}

checkSchema();
