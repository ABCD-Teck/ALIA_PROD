const pool = require('../db');

async function createCalendarSyncTables() {
  const client = await pool.connect();

  try {
    console.log('Starting migration: create calendar sync support tables...\n');
    await client.query('BEGIN');

    // Create calendar_sync_log table if it does not exist
    const logTableCheck = await client.query(
      "SELECT to_regclass('public.calendar_sync_log') AS table_name;"
    );

    const logTableExists = !!logTableCheck.rows[0].table_name;

    if (!logTableExists) {
      await client.query(`
        CREATE TABLE calendar_sync_log (
          log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          interaction_id UUID NOT NULL REFERENCES interaction(interaction_id) ON DELETE CASCADE,
          event_id UUID,
          action VARCHAR(20) NOT NULL,
          status VARCHAR(20) NOT NULL,
          error_message TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          created_by UUID NOT NULL
        );
      `);
      console.log('✓ Created calendar_sync_log table');
    } else {
      console.log('✓ calendar_sync_log table already exists, skipping');
    }

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_calendar_sync_log_interaction
      ON calendar_sync_log (interaction_id, created_at DESC);
    `);
    console.log('✓ Ensured idx_calendar_sync_log_interaction index exists');

    // Create calendar_sync_failures table if it does not exist
    const failureTableCheck = await client.query(
      "SELECT to_regclass('public.calendar_sync_failures') AS table_name;"
    );

    const failureTableExists = !!failureTableCheck.rows[0].table_name;

    if (!failureTableExists) {
      await client.query(`
        CREATE TABLE calendar_sync_failures (
          failure_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          interaction_id UUID NOT NULL REFERENCES interaction(interaction_id) ON DELETE CASCADE,
          action VARCHAR(20) NOT NULL,
          error_message TEXT NOT NULL,
          error_stack TEXT,
          retry_count INTEGER DEFAULT 0,
          last_retry_at TIMESTAMPTZ,
          next_retry_at TIMESTAMPTZ,
          resolved BOOLEAN DEFAULT FALSE,
          resolved_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      console.log('✓ Created calendar_sync_failures table');
    } else {
      console.log('✓ calendar_sync_failures table already exists, skipping');
    }

    await client.query(`
      ALTER TABLE calendar_sync_failures
      ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
    `);
    console.log('✓ Ensured resolved_at column exists on calendar_sync_failures');

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS calendar_sync_failures_active_unique
      ON calendar_sync_failures (interaction_id, action)
      WHERE resolved = FALSE;
    `);
    console.log('✓ Ensured calendar_sync_failures_active_unique index exists');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_calendar_sync_failures_next_retry
      ON calendar_sync_failures (next_retry_at)
      WHERE resolved = FALSE;
    `);
    console.log('✓ Ensured idx_calendar_sync_failures_next_retry index exists');

    await client.query('COMMIT');
    console.log('\nMigration completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during create_calendar_sync_tables migration:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createCalendarSyncTables();
