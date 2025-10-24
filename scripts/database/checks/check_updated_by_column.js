require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE_ALIA,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function checkUpdatedByColumn() {
  const client = await pool.connect();

  try {
    console.log('Checking for updated_by column in customer table...\n');

    // Check if updated_by column exists
    const columnCheck = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'customer'
        AND column_name IN ('updated_by', 'updated_at', 'owner_user_id', 'created_by')
      ORDER BY column_name
    `);

    if (columnCheck.rows.length > 0) {
      console.log('Found related columns:');
      console.table(columnCheck.rows);
    } else {
      console.log('No updated_by, updated_at, owner_user_id, or created_by columns found.');
    }

    // Show full column list for customer table
    console.log('\nAll columns in customer table:');
    const allColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'customer'
      ORDER BY ordinal_position
    `);
    console.table(allColumns.rows);

  } catch (error) {
    console.error('❌ Check failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

checkUpdatedByColumn().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
