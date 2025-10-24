const pool = require('../db');

async function addTestTasks() {
  try {
    console.log('Starting to add test tasks...');

    // First, let's get some existing customers and contacts to link tasks to
    const customersResult = await pool.query('SELECT customer_id FROM customer LIMIT 5');
    const contactsResult = await pool.query('SELECT contact_id FROM contact LIMIT 10');

    const customers = customersResult.rows;
    const contacts = contactsResult.rows;

    console.log(`Found ${customers.length} customers and ${contacts.length} contacts`);

    // Get the first user to assign tasks to
    const userResult = await pool.query('SELECT user_id FROM "user" LIMIT 1');
    const userId = userResult.rows[0]?.user_id;

    if (!userId) {
      console.error('No user found in database. Please create a user first.');
      return;
    }

    console.log(`Using user ID: ${userId}`);

    // Define various test tasks
    const testTasks = [
      {
        subject: 'Follow up on Q1 sales proposal',
        description: 'Contact client to discuss the Q1 sales proposal and address any concerns',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        priority: 'High',
        status: 'Not Started'
      },
      {
        subject: 'Prepare quarterly business review presentation',
        description: 'Create slides for the quarterly business review meeting with stakeholders',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        priority: 'High',
        status: 'In Progress'
      },
      {
        subject: 'Schedule product demo for new client',
        description: 'Coordinate schedules and set up a product demonstration',
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        priority: 'Medium',
        status: 'Not Started'
      },
      {
        subject: 'Review and update customer database',
        description: 'Clean up outdated customer information and verify contact details',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        priority: 'Low',
        status: 'Not Started'
      },
      {
        subject: 'Send contract renewal reminder',
        description: 'Reach out to clients with contracts expiring next month',
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        priority: 'High',
        status: 'Not Started'
      },
      {
        subject: 'Complete customer satisfaction survey analysis',
        description: 'Analyze recent survey results and prepare summary report',
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        priority: 'Medium',
        status: 'In Progress'
      },
      {
        subject: 'Update CRM system with new features',
        description: 'Test and implement new CRM features for the team',
        due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
        priority: 'Low',
        status: 'Not Started'
      },
      {
        subject: 'Prepare monthly sales report',
        description: 'Compile and analyze monthly sales data for management review',
        due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        priority: 'High',
        status: 'In Progress'
      },
      {
        subject: 'Conduct training session on new product line',
        description: 'Organize and deliver training for sales team on new product features',
        due_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
        priority: 'Medium',
        status: 'Not Started'
      },
      {
        subject: 'Research competitor pricing strategy',
        description: 'Gather intelligence on competitor pricing and prepare comparison analysis',
        due_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
        priority: 'Medium',
        status: 'Not Started'
      },
      {
        subject: 'Create marketing materials for trade show',
        description: 'Design and order brochures, banners, and promotional items',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        priority: 'Low',
        status: 'Not Started'
      },
      {
        subject: 'Follow up with pending leads',
        description: 'Contact all leads from last week\'s marketing campaign',
        due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        priority: 'High',
        status: 'Not Started'
      },
      {
        subject: 'Organize team building event',
        description: 'Plan and coordinate quarterly team building activity',
        due_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
        priority: 'Low',
        status: 'Not Started'
      },
      {
        subject: 'Review customer feedback and create action plan',
        description: 'Analyze recent customer feedback and develop improvement strategy',
        due_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
        priority: 'Medium',
        status: 'Not Started'
      },
      {
        subject: 'Update sales forecasting model',
        description: 'Revise Q2 sales forecast based on current pipeline',
        due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        priority: 'High',
        status: 'In Progress'
      },
      // Completed tasks
      {
        subject: 'Submit expense reports for approval',
        description: 'Compile and submit all business expense reports from last month',
        due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        priority: 'Medium',
        status: 'Completed'
      },
      {
        subject: 'Complete onboarding for new team member',
        description: 'Finish onboarding process and setup for new sales representative',
        due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        priority: 'High',
        status: 'Completed'
      },
      {
        subject: 'Review and approve marketing budget',
        description: 'Analyze and approve the proposed marketing budget for next quarter',
        due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        priority: 'Medium',
        status: 'Completed'
      }
    ];

    console.log(`Preparing to insert ${testTasks.length} tasks...`);

    let insertedCount = 0;

    for (let i = 0; i < testTasks.length; i++) {
      const task = testTasks[i];

      // Randomly assign customer and contact (if available)
      const customer_id = customers.length > 0 ? customers[i % customers.length].customer_id : null;
      const contact_id = contacts.length > 0 ? contacts[i % contacts.length].contact_id : null;

      const query = `
        INSERT INTO task (
          subject, description, due_date, priority, status,
          customer_id, contact_id, assigned_to,
          created_by, created_at, updated_at, is_deleted
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), FALSE)
        RETURNING task_id, subject
      `;

      const values = [
        task.subject,
        task.description,
        task.due_date,
        task.priority,
        task.status,
        customer_id,
        contact_id,
        userId,
        userId
      ];

      try {
        const result = await pool.query(query, values);
        insertedCount++;
        console.log(`✓ Inserted task ${insertedCount}/${testTasks.length}: ${result.rows[0].subject} (ID: ${result.rows[0].task_id})`);
      } catch (error) {
        console.error(`✗ Failed to insert task: ${task.subject}`, error.message);
      }
    }

    console.log(`\n✅ Successfully inserted ${insertedCount} out of ${testTasks.length} tasks`);

    // Show summary
    const summaryQuery = `
      SELECT
        status,
        priority,
        COUNT(*) as count
      FROM task
      WHERE is_deleted = false
      GROUP BY status, priority
      ORDER BY priority DESC, status
    `;

    const summary = await pool.query(summaryQuery);

    console.log('\n📊 Task Summary:');
    console.log('Status         | Priority | Count');
    console.log('---------------|----------|------');
    summary.rows.forEach(row => {
      console.log(`${row.status.padEnd(14)} | ${row.priority.padEnd(8)} | ${row.count}`);
    });

  } catch (error) {
    console.error('Error adding test tasks:', error);
  } finally {
    await pool.end();
  }
}

addTestTasks();
