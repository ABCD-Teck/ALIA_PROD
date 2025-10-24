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

async function addArchiveColumn() {
  try {
    console.log('\n=== Adding Archive Column to Interaction Table ===\n');

    // Check if column already exists
    const checkColumn = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'interaction'
      AND column_name = 'archived';
    `);

    if (checkColumn.rows.length > 0) {
      console.log('✅ Archive column already exists!');
    } else {
      // Add archived column (default false)
      await pool.query(`
        ALTER TABLE interaction
        ADD COLUMN archived BOOLEAN DEFAULT FALSE;
      `);
      console.log('✅ Archive column added successfully!');
    }

    // Verify the column was added
    const verify = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'interaction'
      AND column_name = 'archived';
    `);

    console.log('\nColumn details:', verify.rows[0]);

    await pool.end();
    console.log('\n✅ Migration complete!');
  } catch (error) {
    console.error('❌ Error adding archive column:', error);
    process.exit(1);
  }
}

addArchiveColumn();
