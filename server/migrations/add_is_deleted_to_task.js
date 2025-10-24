const pool = require('../db');

async function addIsDeletedColumn() {
  const client = await pool.connect();

  try {
    console.log('Adding is_deleted column to task table...\n');

    // Check if column already exists
    const checkQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'task' AND column_name = 'is_deleted';
    `;

    const checkResult = await client.query(checkQuery);

    if (checkResult.rows.length > 0) {
      console.log('✓ Column is_deleted already exists in task table');
      return;
    }

    // Add the column
    const addColumnQuery = `
      ALTER TABLE task
      ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
    `;

    await client.query(addColumnQuery);
    console.log('✓ Added is_deleted column to task table');

    // Create index for performance
    const createIndexQuery = `
      CREATE INDEX idx_task_is_deleted ON task(is_deleted);
    `;

    await client.query(createIndexQuery);
    console.log('✓ Created index on is_deleted column');

    // Create additional indexes for common queries
    const additionalIndexes = [
      `CREATE INDEX idx_task_is_deleted_due_date ON task(is_deleted, due_date) WHERE is_deleted = false;`,
      `CREATE INDEX idx_task_is_deleted_updated_at ON task(is_deleted, updated_at DESC) WHERE is_deleted = true;`
    ];

    for (const indexQuery of additionalIndexes) {
      try {
        await client.query(indexQuery);
        console.log('✓ Created additional performance index');
      } catch (err) {
        if (err.code === '42P07') {
          console.log('  - Index already exists, skipping');
        } else {
          throw err;
        }
      }
    }

    console.log('\n✓ Migration completed successfully');

  } catch (error) {
    console.error('Error during migration:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addIsDeletedColumn();
