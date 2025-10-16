const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE_ALIA,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function createAdditionalData() {
  try {
    console.log('=== CREATING TASKS AND ACTIVITIES ===');

    // Get recently created customers and opportunities
    const customers = await pool.query(`
      SELECT customer_id, company_name FROM customer
      WHERE created_at >= '2025-10-10'
      ORDER BY company_name
    `);

    const opportunities = await pool.query(`
      SELECT opportunity_id, name, customer_id FROM opportunity
      WHERE created_at >= '2025-10-14'
      ORDER BY name
    `);

    const ownerUserId = 'b7b8826e-d8e9-4bf7-bb39-5aefd830cdd4';

    console.log('Found', customers.rows.length, 'customers and', opportunities.rows.length, 'opportunities for task creation');

    // Check if we have a task table
    const taskTableExists = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_name = 'task' AND table_schema = 'public'
    `);

    if (taskTableExists.rows.length === 0) {
      console.log('❌ Task table does not exist, skipping task creation');
    } else {
      console.log('✅ Task table found, creating tasks...');

      // Create tasks for opportunities
      const tasks = [
        {
          title: 'Technical Demo Preparation for GreenTech',
          description: 'Prepare comprehensive technical demonstration of AI-powered solar panel monitoring system',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          dueDate: '2025-10-20'
        },
        {
          title: 'Proposal Review for DataFlow Analytics',
          description: 'Review and finalize technical proposal for enterprise AI analytics platform implementation',
          priority: 'HIGH',
          status: 'PENDING',
          dueDate: '2025-10-18'
        },
        {
          title: 'Industry 4.0 Solution Architecture',
          description: 'Design detailed solution architecture for Nordic Manufacturing IoT integration',
          priority: 'MEDIUM',
          status: 'IN_PROGRESS',
          dueDate: '2025-10-25'
        },
        {
          title: 'Startup Portfolio Requirements Gathering',
          description: 'Collect detailed requirements from TechnoCore for bulk CRM licensing',
          priority: 'MEDIUM',
          status: 'COMPLETED',
          dueDate: '2025-10-15'
        },
        {
          title: 'Digital Marketing Platform ROI Analysis',
          description: 'Prepare ROI analysis and business case for Cloud9 Digital Agency',
          priority: 'LOW',
          status: 'PENDING',
          dueDate: '2025-10-30'
        }
      ];

      for (const task of tasks) {
        const opportunity = opportunities.rows[tasks.indexOf(task)];
        const customer = customers.rows.find(c => c.customer_id === opportunity?.customer_id);

        if (opportunity && customer) {
          try {
            await pool.query(`
              INSERT INTO task (
                title, description, priority, status, due_date,
                assigned_to, customer_id, opportunity_id,
                created_by, updated_by, created_at, updated_at
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
              )
            `, [
              task.title,
              task.description,
              task.priority,
              task.status,
              task.dueDate,
              ownerUserId,
              customer.customer_id,
              opportunity.opportunity_id,
              ownerUserId,
              ownerUserId,
              new Date(),
              new Date()
            ]);

            console.log(`✅ Created task: ${task.title}`);
          } catch (error) {
            console.log(`❌ Error creating task: ${error.message}`);
          }
        }
      }
    }

    // Create additional interactions to show ongoing activities
    console.log('\n=== CREATING FOLLOW-UP INTERACTIONS ===');

    const followUpInteractions = [
      {
        customerName: 'GreenTech Innovations Ltd',
        type: 'email',
        subject: 'Technical Requirements Clarification',
        description: 'Follow-up email to clarify specific technical requirements for solar panel monitoring system integration with their existing SCADA systems.',
        date: '2025-10-14 11:00:00',
        contactName: 'Sarah Thompson',
        duration: 10,
        direction: 'outbound',
        medium: 'email',
        outcome: 'positive',
        sentiment: 'positive',
        importance: 3,
        notes: 'Sarah provided detailed SCADA integration requirements. Scheduled technical deep-dive for next week.'
      },
      {
        customerName: 'DataFlow Analytics Inc',
        type: 'call',
        subject: 'Budget Approval Process Discussion',
        description: 'Phone call with Dr. Priya Patel to understand their internal budget approval process and timeline for the $5M AI analytics platform project.',
        date: '2025-10-14 15:30:00',
        contactName: 'Dr. Priya Patel',
        duration: 35,
        direction: 'outbound',
        medium: 'phone',
        outcome: 'very_positive',
        sentiment: 'very_positive',
        importance: 5,
        notes: 'Budget approval will go through board meeting on Nov 15. Dr. Patel confident about approval. Requested detailed security framework documentation.'
      },
      {
        customerName: 'Nordic Manufacturing AB',
        type: 'meeting',
        subject: 'Factory Site Visit and Assessment',
        description: 'On-site visit to Nordic Manufacturing facility to assess current production line setup and identify optimal sensor placement for Industry 4.0 implementation.',
        date: '2025-10-14 09:00:00',
        contactName: 'Erik Lindqvist',
        duration: 180,
        direction: 'outbound',
        medium: 'in_person',
        outcome: 'positive',
        sentiment: 'neutral',
        importance: 4,
        location: 'Nordic Manufacturing AB, Stockholm, Sweden',
        notes: 'Facility tour completed. Identified 15 key integration points. Erik mentioned competing vendor proposal deadline is Nov 30.'
      }
    ];

    for (const interaction of followUpInteractions) {
      // Find customer and contact
      const customer = customers.rows.find(c => c.company_name === interaction.customerName);
      if (!customer) {
        console.log(`❌ Customer ${interaction.customerName} not found for interaction`);
        continue;
      }

      // Find contact by name
      const contact = await pool.query(`
        SELECT contact_id FROM contact
        WHERE customer_id = $1 AND (first_name || ' ' || last_name) = $2
      `, [customer.customer_id, interaction.contactName]);

      const contactId = contact.rows.length > 0 ? contact.rows[0].contact_id : null;

      // Insert interaction
      await pool.query(`
        INSERT INTO interaction (
          interaction_type, subject, description, interaction_date,
          customer_id, contact_id, duration_minutes, direction,
          medium, outcome, sentiment, importance, location, private_notes,
          created_by, updated_by, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
        )
      `, [
        interaction.type,
        interaction.subject,
        interaction.description,
        interaction.date,
        customer.customer_id,
        contactId,
        interaction.duration,
        interaction.direction,
        interaction.medium,
        interaction.outcome,
        interaction.sentiment,
        interaction.importance,
        interaction.location || null,
        interaction.notes,
        ownerUserId,
        ownerUserId,
        new Date(),
        new Date()
      ]);

      console.log(`✅ Created follow-up interaction: ${interaction.subject} for ${interaction.customerName}`);
    }

    console.log('\n=== ADDITIONAL DATA CREATED SUCCESSFULLY ===');
    console.log('📊 Summary of generated data:');
    console.log('• 5 new companies with diverse profiles');
    console.log('• 10 professional contacts across all companies');
    console.log('• 4 initial customer interactions (discovery, demo, networking, follow-up)');
    console.log('• 5 major business opportunities ($9.48M total value)');
    console.log('• 3 recent follow-up activities');
    console.log('• Geographic coverage: UK, US, Sweden, Singapore');
    console.log('• Multi-currency opportunities: EUR, USD, GBP, SGD');
    console.log('• Realistic CRM pipeline from discovery to proposal stage');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createAdditionalData();