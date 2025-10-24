const { Pool } = require('pg');

const pool = new Pool({
  host: 'abcdteck-ce.cdggcuqweof7.eu-central-1.rds.amazonaws.com',
  port: 5432,
  database: 'alia_crm',
  user: 'postgres',
  password: 'ABCDTeck2025',
  ssl: { rejectUnauthorized: false }
});

async function verifyTasks() {
  try {
    // Get total count
    const totalQuery = 'SELECT COUNT(*) as total FROM task WHERE is_deleted = false';
    const totalResult = await pool.query(totalQuery);
    console.log('\n✅ DATABASE VERIFICATION');
    console.log('========================');
    console.log(`Total active tasks: ${totalResult.rows[0].total}`);
    console.log('');

    // Get breakdown by priority and status
    const statsQuery = `
      SELECT priority, status, COUNT(*) as count
      FROM task
      WHERE is_deleted = false
      GROUP BY priority, status
      ORDER BY
        CASE priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 WHEN 'LOW' THEN 3 END,
        CASE status WHEN 'NEW' THEN 1 WHEN 'IN_PROGRESS' THEN 2 WHEN 'COMPLETED' THEN 3 WHEN 'CANCELLED' THEN 4 END
    `;
    const statsResult = await pool.query(statsQuery);

    console.log('Task Breakdown:');
    console.log('---------------');
    statsResult.rows.forEach(row => {
      console.log(`${row.priority.padEnd(8)} | ${row.status.padEnd(15)} | ${row.count} tasks`);
    });
    console.log('');

    // Get sample tasks
    const sampleQuery = `
      SELECT task_id, subject, priority, status, due_date
      FROM task
      WHERE is_deleted = false
      ORDER BY due_date ASC NULLS LAST
      LIMIT 5
    `;
    const sampleResult = await pool.query(sampleQuery);

    console.log('Sample Tasks (First 5 by due date):');
    console.log('------------------------------------');
    sampleResult.rows.forEach((task, i) => {
      console.log(`${i + 1}. [${task.priority}] ${task.subject}`);
      console.log(`   Status: ${task.status} | Due: ${task.due_date || 'No due date'}`);
    });
    console.log('');
    console.log('✅ Database is ready! You can now test the Task Manager UI at:');
    console.log('   http://localhost:3000');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyTasks();
