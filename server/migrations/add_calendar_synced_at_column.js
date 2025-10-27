const pool = require('../db');

async function addCalendarSyncedAtColumn() {
  const client = await pool.connect();

  try {
    console.log('Starting migration: add calendar_synced_at column to interaction table...\n');

    const columnExistsQuery = `
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'interaction'
        AND column_name = 'calendar_synced_at'
      LIMIT 1;
    `;
    const columnExists = await client.query(columnExistsQuery);

    if (columnExists.rows.length === 0) {
      await client.query('ALTER TABLE interaction ADD COLUMN calendar_synced_at TIMESTAMPTZ;');
      console.log('✓ Added calendar_synced_at column to interaction table');
    } else {
      console.log('✓ calendar_synced_at column already exists, skipping');
    }

    const indexName = 'idx_interaction_calendar_synced_at';
    const indexExistsQuery = `
      SELECT 1
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = 'interaction'
        AND indexname = $1
      LIMIT 1;
    `;
    const indexExists = await client.query(indexExistsQuery, [indexName]);

    if (indexExists.rows.length === 0) {
      await client.query(`CREATE INDEX ${indexName} ON interaction (calendar_synced_at);`);
      console.log('✓ Created idx_interaction_calendar_synced_at index');
    } else {
      console.log('✓ idx_interaction_calendar_synced_at index already exists, skipping');
    }

    console.log('\nMigration completed successfully');
  } catch (error) {
    console.error('Error during add_calendar_synced_at_column migration:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addCalendarSyncedAtColumn();
