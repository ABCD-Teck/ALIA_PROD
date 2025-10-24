const { Pool } = require('pg');

const pool = new Pool({
  host: 'abcdteck-ce.cdggcuqweof7.eu-central-1.rds.amazonaws.com',
  port: 5432,
  database: 'alia_crm',
  user: 'postgres',
  password: 'ABCDTeck2025',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkTaskSchema() {
  const client = await pool.connect();

  try {
    console.log('🔍 Checking task table schema...\n');

    // Get table structure
    const schemaQuery = `
      SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'task'
      ORDER BY ordinal_position;
    `;

    const schemaResult = await client.query(schemaQuery);

    console.log('📋 Task Table Columns:');
    console.log('================================================================================');
    schemaResult.rows.forEach(col => {
      console.log(`${col.column_name.padEnd(25)} | ${col.data_type.padEnd(20)} | Nullable: ${col.is_nullable}`);
    });

    console.log('\n');

    // Get check constraints
    const constraintsQuery = `
      SELECT con.conname, pg_get_constraintdef(con.oid)
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      WHERE rel.relname = 'task' AND con.contype = 'c';
    `;

    const constraintsResult = await client.query(constraintsQuery);

    console.log('🔒 Check Constraints:');
    console.log('================================================================================');
    if (constraintsResult.rows.length > 0) {
      constraintsResult.rows.forEach(constraint => {
        console.log(`\nConstraint: ${constraint.conname}`);
        console.log(`Definition: ${constraint.pg_get_constraintdef}`);
      });
    } else {
      console.log('No check constraints found');
    }

    console.log('\n');

    // Get one existing task to see the data format
    const sampleQuery = `
      SELECT task_id, subject, priority, status, due_date, created_at
      FROM task
      LIMIT 1
    `;

    const sampleResult = await client.query(sampleQuery);

    console.log('📝 Sample Task (if exists):');
    console.log('================================================================================');
    if (sampleResult.rows.length > 0) {
      const task = sampleResult.rows[0];
      console.log(`ID: ${task.task_id}`);
      console.log(`Subject: ${task.subject}`);
      console.log(`Priority: ${task.priority}`);
      console.log(`Status: ${task.status}`);
      console.log(`Due Date: ${task.due_date}`);
      console.log(`Created: ${task.created_at}`);
    } else {
      console.log('No existing tasks found');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkTaskSchema();
