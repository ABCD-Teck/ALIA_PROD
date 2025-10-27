const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE_ALIA,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

async function addTimeFields() {
  const client = await pool.connect();

  try {
    console.log('Starting migration: Adding start_time and end_time to interaction table...');

    await client.query('BEGIN');

    // Add start_time column (TIME type for time of day)
    await client.query(`
      ALTER TABLE interaction
      ADD COLUMN IF NOT EXISTS start_time TIME
    `);
    console.log('✓ Added start_time column');

    // Add end_time column (TIME type for time of day)
    await client.query(`
      ALTER TABLE interaction
      ADD COLUMN IF NOT EXISTS end_time TIME
    `);
    console.log('✓ Added end_time column');

    // Update existing records to derive start_time from interaction_date
    await client.query(`
      UPDATE interaction
      SET start_time = interaction_date::TIME
      WHERE start_time IS NULL AND interaction_date IS NOT NULL
    `);
    console.log('✓ Populated start_time from interaction_date for existing records');

    // Update existing records to calculate end_time based on duration_minutes
    await client.query(`
      UPDATE interaction
      SET end_time = (start_time::INTERVAL + (duration_minutes || ' minutes')::INTERVAL)::TIME
      WHERE end_time IS NULL
        AND start_time IS NOT NULL
        AND duration_minutes IS NOT NULL
        AND duration_minutes > 0
    `);
    console.log('✓ Calculated end_time based on start_time + duration_minutes');

    await client.query('COMMIT');

    console.log('\n✅ Migration completed successfully!');

    // Verify the changes
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'interaction' AND column_name IN ('start_time', 'end_time')
      ORDER BY column_name
    `);

    console.log('\n=== New columns ===');
    console.table(result.rows);

    // Show sample data
    const sampleData = await client.query(`
      SELECT
        interaction_id,
        subject,
        interaction_date::DATE as date,
        start_time,
        end_time,
        duration_minutes
      FROM interaction
      WHERE interaction_date IS NOT NULL
      LIMIT 5
    `);

    console.log('\n=== Sample data (first 5 records) ===');
    console.table(sampleData.rows);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
addTimeFields();
