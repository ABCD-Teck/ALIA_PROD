const pool = require('../db');

async function querySchema() {
  try {
    // Query interaction table schema
    console.log('\n=== INTERACTION TABLE SCHEMA ===\n');
    const interactionSchemaQuery = `
      SELECT
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'interaction'
      ORDER BY ordinal_position;
    `;
    const interactionSchema = await pool.query(interactionSchemaQuery);
    console.table(interactionSchema.rows);

    // Check if calendar_events table exists
    console.log('\n=== CHECKING FOR CALENDAR_EVENTS TABLE ===\n');
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'calendar_events'
      );
    `;
    const tableExists = await pool.query(tableExistsQuery);
    console.log('Calendar events table exists:', tableExists.rows[0].exists);

    if (tableExists.rows[0].exists) {
      console.log('\n=== CALENDAR_EVENTS TABLE SCHEMA ===\n');
      const calendarSchemaQuery = `
        SELECT
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = 'calendar_events'
        ORDER BY ordinal_position;
      `;
      const calendarSchema = await pool.query(calendarSchemaQuery);
      console.table(calendarSchema.rows);
    } else {
      console.log('Calendar events table does not exist yet.');
    }

    // Check for tasks table (similar to calendar events)
    console.log('\n=== CHECKING FOR TASK TABLE ===\n');
    const taskExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'task'
      );
    `;
    const taskExists = await pool.query(taskExistsQuery);
    console.log('Task table exists:', taskExists.rows[0].exists);

    if (taskExists.rows[0].exists) {
      console.log('\n=== TASK TABLE SCHEMA (for reference) ===\n');
      const taskSchemaQuery = `
        SELECT
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = 'task'
        ORDER BY ordinal_position;
      `;
      const taskSchema = await pool.query(taskSchemaQuery);
      console.table(taskSchema.rows);
    }

  } catch (error) {
    console.error('Error querying schema:', error);
  } finally {
    await pool.end();
  }
}

querySchema();
