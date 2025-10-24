const { Pool } = require('pg');

// Database configuration from .env
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

async function createTestTasks() {
  const client = await pool.connect();

  try {
    console.log('🔌 Connected to database successfully!');
    console.log('📊 Database: alia_crm');
    console.log('');

    // First, get a user ID to assign tasks to
    const userQuery = 'SELECT user_id FROM "user" LIMIT 1';
    const userResult = await client.query(userQuery);

    if (userResult.rows.length === 0) {
      console.error('❌ No users found in database. Please create a user first.');
      return;
    }

    const userId = userResult.rows[0].user_id;
    console.log(`✓ Using user ID: ${userId}`);
    console.log('');

    // Get some customers and contacts (if available)
    const customersQuery = 'SELECT customer_id FROM customer LIMIT 5';
    const contactsQuery = 'SELECT contact_id FROM contact LIMIT 10';

    const customersResult = await client.query(customersQuery);
    const contactsResult = await client.query(contactsQuery);

    const customers = customersResult.rows;
    const contacts = contactsResult.rows;

    console.log(`✓ Found ${customers.length} customers`);
    console.log(`✓ Found ${contacts.length} contacts`);
    console.log('');

    // Define test tasks with various scenarios
    const testTasks = [
      {
        subject: 'Follow up on Q1 sales proposal',
        description: 'Contact client ABC Corp to discuss the Q1 sales proposal and address any outstanding concerns',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        priority: 'HIGH',
        status: 'NEW'
      },
      {
        subject: 'Prepare quarterly business review presentation',
        description: 'Create comprehensive slides for the quarterly business review meeting with key stakeholders',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        priority: 'HIGH',
        status: 'IN_PROGRESS'
      },
      {
        subject: 'Schedule product demo for new prospect',
        description: 'Coordinate schedules with technical team and set up comprehensive product demonstration',
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
        priority: 'MEDIUM',
        status: 'NEW'
      },
      {
        subject: 'Review and update customer database entries',
        description: 'Clean up outdated customer information and verify all contact details are current',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
        priority: 'LOW',
        status: 'NEW'
      },
      {
        subject: 'Send contract renewal reminders',
        description: 'Reach out to all clients with contracts expiring in the next 30 days',
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        priority: 'HIGH',
        status: 'NEW'
      },
      {
        subject: 'Complete customer satisfaction survey analysis',
        description: 'Analyze Q4 survey results and prepare comprehensive summary report for management',
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
        priority: 'MEDIUM',
        status: 'IN_PROGRESS'
      },
      {
        subject: 'Update CRM system with new automation features',
        description: 'Test and implement new CRM automation features for the sales team',
        due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks
        priority: 'LOW',
        status: 'NEW'
      },
      {
        subject: 'Prepare monthly sales performance report',
        description: 'Compile and analyze monthly sales data for executive review meeting',
        due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
        priority: 'HIGH',
        status: 'IN_PROGRESS'
      },
      {
        subject: 'Conduct training session on new product features',
        description: 'Organize and deliver comprehensive training for sales team on latest product updates',
        due_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days
        priority: 'MEDIUM',
        status: 'NEW'
      },
      {
        subject: 'Research competitor pricing strategies',
        description: 'Gather competitive intelligence and prepare detailed pricing comparison analysis',
        due_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days
        priority: 'MEDIUM',
        status: 'NEW'
      },
      {
        subject: 'Create marketing materials for upcoming trade show',
        description: 'Design and order brochures, banners, and promotional items for industry conference',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        priority: 'LOW',
        status: 'NEW'
      },
      {
        subject: 'Follow up with warm leads from last campaign',
        description: 'Contact all qualified leads generated from last week\'s digital marketing campaign',
        due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
        priority: 'HIGH',
        status: 'NEW'
      },
      {
        subject: 'Plan quarterly team building event',
        description: 'Organize and coordinate Q2 team building activity for sales department',
        due_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days
        priority: 'LOW',
        status: 'NEW'
      },
      {
        subject: 'Analyze customer feedback and create action plan',
        description: 'Review recent customer feedback from support tickets and develop improvement strategy',
        due_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days
        priority: 'MEDIUM',
        status: 'NEW'
      },
      {
        subject: 'Update Q2 sales forecast model',
        description: 'Revise quarterly sales forecast based on current pipeline and market conditions',
        due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days
        priority: 'HIGH',
        status: 'IN_PROGRESS'
      },
      // Some completed tasks
      {
        subject: 'Submit expense reports for approval',
        description: 'Compile and submit all business expense reports from last month',
        due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        priority: 'MEDIUM',
        status: 'COMPLETED'
      },
      {
        subject: 'Complete onboarding for new team member',
        description: 'Finish comprehensive onboarding process for new sales representative',
        due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        priority: 'HIGH',
        status: 'COMPLETED'
      },
      {
        subject: 'Review and approve marketing budget proposal',
        description: 'Analyze and approve the proposed marketing budget for next quarter',
        due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        priority: 'MEDIUM',
        status: 'COMPLETED'
      },
      {
        subject: 'Respond to urgent customer inquiry from VIP client',
        description: 'Address critical issue raised by key enterprise customer immediately',
        due_date: new Date(Date.now()), // Today
        priority: 'HIGH',
        status: 'NEW'
      },
      {
        subject: 'Attend product launch planning meeting',
        description: 'Join cross-functional team meeting to discuss new product launch strategy and timeline',
        due_date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days
        priority: 'MEDIUM',
        status: 'NEW'
      }
    ];

    console.log(`📝 Preparing to insert ${testTasks.length} test tasks...`);
    console.log('');

    let successCount = 0;
    let failCount = 0;

    // Insert each task
    for (let i = 0; i < testTasks.length; i++) {
      const task = testTasks[i];

      // Randomly assign customer and contact (if available)
      const customerId = customers.length > 0 ? customers[i % customers.length].customer_id : null;
      const contactId = contacts.length > 0 ? contacts[i % contacts.length].contact_id : null;

      const insertQuery = `
        INSERT INTO task (
          subject, description, due_date, priority, status,
          customer_id, contact_id, assigned_to,
          created_by, created_at, updated_at, is_deleted
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), FALSE)
        RETURNING task_id, subject, priority, status, due_date
      `;

      const values = [
        task.subject,
        task.description,
        task.due_date,
        task.priority,
        task.status,
        customerId,
        contactId,
        userId,
        userId
      ];

      try {
        const result = await client.query(insertQuery, values);
        const insertedTask = result.rows[0];
        successCount++;

        console.log(`✓ [${successCount}/${testTasks.length}] Created: "${insertedTask.subject}"`);
        console.log(`  ID: ${insertedTask.task_id} | Priority: ${insertedTask.priority} | Status: ${insertedTask.status}`);
      } catch (error) {
        failCount++;
        console.error(`✗ [${i + 1}/${testTasks.length}] Failed: "${task.subject}"`);
        console.error(`  Error: ${error.message}`);
      }
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('📊 TASK CREATION SUMMARY');
    console.log('═══════════════════════════════════════════════════');
    console.log(`✓ Successfully created: ${successCount} tasks`);
    console.log(`✗ Failed: ${failCount} tasks`);
    console.log(`📝 Total: ${testTasks.length} tasks`);
    console.log('═══════════════════════════════════════════════════');
    console.log('');

    // Get task statistics
    const statsQuery = `
      SELECT
        status,
        priority,
        COUNT(*) as count
      FROM task
      WHERE is_deleted = false
      GROUP BY status, priority
      ORDER BY
        CASE priority
          WHEN 'High' THEN 1
          WHEN 'Medium' THEN 2
          WHEN 'Low' THEN 3
        END,
        status
    `;

    const statsResult = await client.query(statsQuery);

    console.log('📈 Current Database Statistics:');
    console.log('');
    console.log('Status           | Priority | Count');
    console.log('-----------------|----------|-------');

    statsResult.rows.forEach(row => {
      const status = row.status.padEnd(16);
      const priority = row.priority.padEnd(8);
      const count = row.count.toString().padStart(5);
      console.log(`${status} | ${priority} | ${count}`);
    });

    console.log('');

    // Get total count
    const totalQuery = 'SELECT COUNT(*) as total FROM task WHERE is_deleted = false';
    const totalResult = await client.query(totalQuery);
    const totalTasks = totalResult.rows[0].total;

    console.log(`🎯 Total active tasks in database: ${totalTasks}`);
    console.log('');
    console.log('✅ All done! You can now view these tasks in the Task Manager UI.');
    console.log('');
    console.log('📌 Next Steps:');
    console.log('   1. Open the application: http://localhost:3000');
    console.log('   2. Log in with your credentials');
    console.log('   3. Navigate to Task Manager');
    console.log('   4. Verify all tasks are displayed correctly');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ ERROR:', error.message);
    console.error('');
    console.error('Stack trace:', error.stack);
  } finally {
    client.release();
    await pool.end();
    console.log('🔌 Database connection closed.');
  }
}

// Run the script
console.log('');
console.log('═══════════════════════════════════════════════════');
console.log('🚀 TASK CREATION SCRIPT');
console.log('═══════════════════════════════════════════════════');
console.log('');

createTestTasks().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
