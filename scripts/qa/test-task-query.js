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

async function testTaskQuery() {
  try {
    console.log('Testing database connection...');

    // Get all tasks
    const result = await pool.query(`
      SELECT task_id, subject, priority, status, due_date, is_deleted
      FROM task
      WHERE is_deleted = false
      LIMIT 5
    `);

    console.log('\nFound tasks:');
    console.log(JSON.stringify(result.rows, null, 2));

    if (result.rows.length > 0) {
      // Test fetching a specific task
      const firstTaskId = result.rows[0].task_id;
      console.log(`\nTesting fetch of specific task: ${firstTaskId}`);

      const singleTask = await pool.query(`
        SELECT t.*
        FROM task t
        WHERE t.task_id = $1 AND t.is_deleted = false
      `, [firstTaskId]);

      console.log('\nSingle task result:');
      console.log(JSON.stringify(singleTask.rows, null, 2));
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testTaskQuery();
