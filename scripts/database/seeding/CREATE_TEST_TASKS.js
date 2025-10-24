/**
 * BROWSER CONSOLE SCRIPT TO CREATE TEST TASKS
 *
 * HOW TO USE:
 * 1. Open the Alia Web application in your browser (http://localhost:3000)
 * 2. Log in to the application
 * 3. Open Browser Developer Tools (Press F12)
 * 4. Go to the "Console" tab
 * 5. Copy and paste this entire script into the console
 * 6. Press Enter to run it
 * 7. Watch as tasks are created!
 * 8. Navigate to the Task Manager page to see the results
 */

(async function createTestTasks() {
  console.log('%c🚀 Starting Task Creation Script', 'color: blue; font-size: 16px; font-weight: bold');

  // Get the access token from localStorage
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    console.error('%c❌ ERROR: Not logged in! Please log in first.', 'color: red; font-size: 14px');
    return;
  }

  console.log('%c✓ Found access token', 'color: green');

  const API_BASE_URL = '/api';

  // Helper function to create a task
  async function createTask(taskData) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create task');
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to create task "${taskData.subject}":`, error.message);
      return null;
    }
  }

  // Define test tasks
  const testTasks = [
    {
      subject: 'Follow up on Q1 sales proposal',
      description: 'Contact client to discuss the Q1 sales proposal and address any concerns',
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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

  console.log(`%c📝 Creating ${testTasks.length} test tasks...`, 'color: blue; font-size: 14px');
  console.log('');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < testTasks.length; i++) {
    const task = testTasks[i];

    console.log(`%c[${i + 1}/${testTasks.length}] Creating: "${task.subject}"`, 'color: gray');

    const result = await createTask(task);

    if (result) {
      successCount++;
      console.log(`%c  ✓ Success (ID: ${result.task_id})`, 'color: green');
    } else {
      failCount++;
      console.log(`%c  ✗ Failed`, 'color: red');
    }

    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('');
  console.log('%c========================================', 'color: blue; font-weight: bold');
  console.log('%c📊 Task Creation Summary', 'color: blue; font-size: 16px; font-weight: bold');
  console.log('%c========================================', 'color: blue; font-weight: bold');
  console.log(`%c✓ Successfully created: ${successCount}`, 'color: green; font-size: 14px');
  console.log(`%c✗ Failed: ${failCount}`, 'color: red; font-size: 14px');
  console.log(`%c📝 Total: ${testTasks.length}`, 'color: blue; font-size: 14px');
  console.log('%c========================================', 'color: blue; font-weight: bold');
  console.log('');

  // Fetch task summary
  console.log('%c📋 Fetching current tasks...', 'color: blue; font-size: 14px');

  try {
    const response = await fetch(`${API_BASE_URL}/tasks?limit=100`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      const tasks = data.tasks;

      console.log(`%c✓ Total active tasks: ${tasks.length}`, 'color: green; font-size: 14px');
      console.log('');

      // Group by status and priority
      const statusCount = {};
      const priorityCount = {};

      tasks.forEach(task => {
        statusCount[task.status] = (statusCount[task.status] || 0) + 1;
        priorityCount[task.priority] = (priorityCount[task.priority] || 0) + 1;
      });

      console.log('%cBy Status:', 'font-weight: bold');
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });

      console.log('');
      console.log('%cBy Priority:', 'font-weight: bold');
      Object.entries(priorityCount).forEach(([priority, count]) => {
        console.log(`  ${priority}: ${count}`);
      });

      console.log('');
      console.log('%c✅ Done! Navigate to the Task Manager page to see your tasks.', 'color: green; font-size: 16px; font-weight: bold');

    } else {
      console.warn('Could not fetch task summary');
    }

  } catch (error) {
    console.error('Error fetching task summary:', error);
  }

})();
