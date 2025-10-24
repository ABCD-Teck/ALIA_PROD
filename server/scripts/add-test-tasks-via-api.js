const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3001/api';
const AUTH_EMAIL = 'n3bula.chen@gmail.com';
const AUTH_PASSWORD = 'Poqw1029!';

async function loginAndGetToken() {
  try {
    console.log('Logging in...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: AUTH_EMAIL,
      password: AUTH_PASSWORD
    });

    if (response.data.accessToken) {
      console.log('✓ Login successful');
      return response.data.accessToken;
    } else {
      throw new Error('No access token received');
    }
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function createTask(token, taskData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/tasks`, taskData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to create task "${taskData.subject}":`, error.response?.data || error.message);
    return null;
  }
}

async function addTestTasks() {
  try {
    // Login first
    const token = await loginAndGetToken();

    // Define various test tasks
    const testTasks = [
      {
        subject: 'Follow up on Q1 sales proposal',
        description: 'Contact client to discuss the Q1 sales proposal and address any concerns',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
        priority: 'High',
        status: 'Not Started'
      },
      {
        subject: 'Prepare quarterly business review presentation',
        description: 'Create slides for the quarterly business review meeting with stakeholders',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'High',
        status: 'In Progress'
      },
      {
        subject: 'Schedule product demo for new client',
        description: 'Coordinate schedules and set up a product demonstration',
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'Medium',
        status: 'Not Started'
      },
      {
        subject: 'Review and update customer database',
        description: 'Clean up outdated customer information and verify contact details',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'Low',
        status: 'Not Started'
      },
      {
        subject: 'Send contract renewal reminder',
        description: 'Reach out to clients with contracts expiring next month',
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'High',
        status: 'Not Started'
      },
      {
        subject: 'Complete customer satisfaction survey analysis',
        description: 'Analyze recent survey results and prepare summary report',
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'Medium',
        status: 'In Progress'
      },
      {
        subject: 'Update CRM system with new features',
        description: 'Test and implement new CRM features for the team',
        due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'Low',
        status: 'Not Started'
      },
      {
        subject: 'Prepare monthly sales report',
        description: 'Compile and analyze monthly sales data for management review',
        due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'High',
        status: 'In Progress'
      },
      {
        subject: 'Conduct training session on new product line',
        description: 'Organize and deliver training for sales team on new product features',
        due_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'Medium',
        status: 'Not Started'
      },
      {
        subject: 'Research competitor pricing strategy',
        description: 'Gather intelligence on competitor pricing and prepare comparison analysis',
        due_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'Medium',
        status: 'Not Started'
      },
      {
        subject: 'Create marketing materials for trade show',
        description: 'Design and order brochures, banners, and promotional items',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'Low',
        status: 'Not Started'
      },
      {
        subject: 'Follow up with pending leads',
        description: 'Contact all leads from last week\'s marketing campaign',
        due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'High',
        status: 'Not Started'
      },
      {
        subject: 'Organize team building event',
        description: 'Plan and coordinate quarterly team building activity',
        due_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'Low',
        status: 'Not Started'
      },
      {
        subject: 'Review customer feedback and create action plan',
        description: 'Analyze recent customer feedback and develop improvement strategy',
        due_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'Medium',
        status: 'Not Started'
      },
      {
        subject: 'Update sales forecasting model',
        description: 'Revise Q2 sales forecast based on current pipeline',
        due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'High',
        status: 'In Progress'
      },
      // Completed tasks
      {
        subject: 'Submit expense reports for approval',
        description: 'Compile and submit all business expense reports from last month',
        due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'Medium',
        status: 'Completed'
      },
      {
        subject: 'Complete onboarding for new team member',
        description: 'Finish onboarding process and setup for new sales representative',
        due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'High',
        status: 'Completed'
      },
      {
        subject: 'Review and approve marketing budget',
        description: 'Analyze and approve the proposed marketing budget for next quarter',
        due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'Medium',
        status: 'Completed'
      },
      {
        subject: 'Respond to urgent customer inquiry',
        description: 'Address critical issue raised by key client',
        due_date: new Date(Date.now()).toISOString().split('T')[0],
        priority: 'High',
        status: 'Not Started'
      },
      {
        subject: 'Attend product launch meeting',
        description: 'Join the team meeting to discuss new product launch strategy',
        due_date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'Medium',
        status: 'Not Started'
      }
    ];

    console.log(`\nPreparing to create ${testTasks.length} test tasks...\n`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < testTasks.length; i++) {
      const task = testTasks[i];
      console.log(`Creating task ${i + 1}/${testTasks.length}: "${task.subject}"...`);

      const result = await createTask(token, task);

      if (result) {
        successCount++;
        console.log(`  ✓ Created successfully (ID: ${result.task_id})`);
      } else {
        failCount++;
        console.log(`  ✗ Failed`);
      }

      // Add small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n========================================`);
    console.log(`📊 Task Creation Summary:`);
    console.log(`========================================`);
    console.log(`✓ Successfully created: ${successCount}`);
    console.log(`✗ Failed: ${failCount}`);
    console.log(`📝 Total: ${testTasks.length}`);
    console.log(`========================================\n`);

    // Fetch and display task summary from API
    console.log('Fetching current tasks from API...\n');

    try {
      const tasksResponse = await axios.get(`${API_BASE_URL}/tasks?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const tasks = tasksResponse.data.tasks;

      console.log(`📋 Total active tasks in database: ${tasks.length}\n`);

      // Group by status and priority
      const statusCount = {};
      const priorityCount = {};

      tasks.forEach(task => {
        statusCount[task.status] = (statusCount[task.status] || 0) + 1;
        priorityCount[task.priority] = (priorityCount[task.priority] || 0) + 1;
      });

      console.log('By Status:');
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });

      console.log('\nBy Priority:');
      Object.entries(priorityCount).forEach(([priority, count]) => {
        console.log(`  ${priority}: ${count}`);
      });

      console.log('\n✅ Tasks created successfully! You can now view them in the Task Manager UI.');

    } catch (error) {
      console.error('Failed to fetch task summary:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Error in main process:', error.message);
    process.exit(1);
  }
}

// Check if axios is installed
try {
  require.resolve('axios');
} catch (e) {
  console.error('Error: axios is not installed. Please run: npm install axios');
  process.exit(1);
}

addTestTasks();
