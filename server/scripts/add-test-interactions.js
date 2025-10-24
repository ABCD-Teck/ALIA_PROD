/**
 * Script to add test interactions to the database
 * Run with: node server/scripts/add-test-interactions.js
 */

const pool = require('../db');

const testInteractions = [
  {
    interaction_type: 'visit',
    subject: 'Visit BYD Europe Branch - Q4 Strategy Discussion',
    description: 'Discussed European market expansion strategy and new product lineup for 2025. Very productive meeting with positive reception.',
    interaction_date: '2024-12-15T10:00:00Z',
    customer_name: 'BYD',
    duration_minutes: 120,
    direction: 'outbound',
    medium: 'in-person',
    outcome: 'successful',
    sentiment: 'positive',
    importance: 5,
    location: 'BYD Europe Headquarters, Amsterdam',
    private_notes: 'Key stakeholders present: CEO, CFO, Head of EU Operations. Follow-up: Send proposal by Dec 20.'
  },
  {
    interaction_type: 'phone',
    subject: 'Amazon AWS Integration Discussion',
    description: 'Technical call regarding cloud infrastructure integration. Discussed API requirements and timeline.',
    interaction_date: '2024-12-10T14:30:00Z',
    customer_name: 'Amazon',
    duration_minutes: 45,
    direction: 'outbound',
    medium: 'phone',
    outcome: 'successful',
    sentiment: 'neutral',
    importance: 3,
    location: null,
    private_notes: 'Action items: 1) Prepare technical documentation, 2) Schedule follow-up for Dec 18'
  },
  {
    interaction_type: 'meeting',
    subject: 'Tesla Supplier Partnership Meeting',
    description: 'Initial partnership discussion for battery components supply. Reviewed technical specifications and pricing.',
    interaction_date: '2024-12-08T09:00:00Z',
    customer_name: 'Tesla',
    duration_minutes: 90,
    direction: 'outbound',
    medium: 'video',
    outcome: 'successful',
    sentiment: 'positive',
    importance: 5,
    location: 'Video Conference',
    private_notes: 'Very interested in our new battery technology. Next steps: Send samples and detailed spec sheets.'
  },
  {
    interaction_type: 'marketing',
    subject: 'Apple Product Launch Event',
    description: 'Attended Apple's product launch event. Showcased our new display technology components.',
    interaction_date: '2024-12-01T18:00:00Z',
    customer_name: 'Apple',
    duration_minutes: 180,
    direction: 'outbound',
    medium: 'in-person',
    outcome: 'successful',
    sentiment: 'positive',
    importance: 4,
    location: 'Apple Park, Cupertino, CA',
    private_notes: 'Great networking opportunity. Connected with 3 key decision makers.'
  },
  {
    interaction_type: 'technical',
    subject: 'Microsoft Azure Technical Workshop',
    description: 'Participated in Azure technical workshop. Learned about new cloud services and AI capabilities.',
    interaction_date: '2024-11-28T13:00:00Z',
    customer_name: 'Microsoft',
    duration_minutes: 240,
    direction: 'inbound',
    medium: 'in-person',
    outcome: 'successful',
    sentiment: 'positive',
    importance: 3,
    location: 'Microsoft Campus, Redmond, WA',
    private_notes: 'Excellent technical insights. Consider implementing Azure AI services.'
  },
  {
    interaction_type: 'email',
    subject: 'Samsung Component Inquiry',
    description: 'Email correspondence regarding component specifications and availability.',
    interaction_date: '2024-11-25T11:00:00Z',
    customer_name: 'Samsung',
    duration_minutes: null,
    direction: 'inbound',
    medium: 'email',
    outcome: 'pending',
    sentiment: 'neutral',
    importance: 2,
    location: null,
    private_notes: 'Awaiting detailed specifications from Samsung team.'
  },
  {
    interaction_type: 'visit',
    subject: 'Google Cloud Partnership Kickoff',
    description: 'Kickoff meeting for new cloud partnership initiative. Discussed integration roadmap and milestones.',
    interaction_date: '2024-11-20T10:00:00Z',
    customer_name: 'Google',
    duration_minutes: 120,
    direction: 'outbound',
    medium: 'in-person',
    outcome: 'successful',
    sentiment: 'positive',
    importance: 5,
    location: 'Google Headquarters, Mountain View, CA',
    private_notes: 'Project timeline: 6 months. Budget approved. Next meeting: Jan 15, 2025'
  },
  {
    interaction_type: 'phone',
    subject: 'Toyota Manufacturing Process Review',
    description: 'Phone call to review manufacturing process improvements and quality standards.',
    interaction_date: '2024-11-15T15:30:00Z',
    customer_name: 'Toyota',
    duration_minutes: 60,
    direction: 'outbound',
    medium: 'phone',
    outcome: 'successful',
    sentiment: 'positive',
    importance: 4,
    location: null,
    private_notes: 'Toyota impressed with our quality improvements. Potential for increased order volume.'
  },
  {
    interaction_type: 'meeting',
    subject: 'Netflix Content Delivery Network Discussion',
    description: 'Technical meeting about CDN infrastructure and performance optimization.',
    interaction_date: '2024-11-10T14:00:00Z',
    customer_name: 'Netflix',
    duration_minutes: 90,
    direction: 'outbound',
    medium: 'video',
    outcome: 'successful',
    sentiment: 'neutral',
    importance: 3,
    location: 'Video Conference',
    private_notes: 'Need to improve latency in APAC region. Action: Prepare performance analysis report.'
  },
  {
    interaction_type: 'visit',
    subject: 'Ford Electric Vehicle Component Presentation',
    description: 'Presented our new EV battery management system to Ford engineering team.',
    interaction_date: '2024-11-05T09:00:00Z',
    customer_name: 'Ford',
    duration_minutes: 150,
    direction: 'outbound',
    medium: 'in-person',
    outcome: 'successful',
    sentiment: 'positive',
    importance: 5,
    location: 'Ford Research Center, Dearborn, MI',
    private_notes: 'Very positive feedback. Ford wants to start pilot program in Q1 2025.'
  }
];

async function addTestInteractions() {
  const client = await pool.connect();

  try {
    console.log('Starting to add test interactions...\n');

    for (const interaction of testInteractions) {
      // Find customer ID by name
      const customerQuery = `
        SELECT customer_id FROM customer
        WHERE company_name ILIKE $1
        LIMIT 1
      `;

      const customerResult = await client.query(customerQuery, [interaction.customer_name]);

      if (customerResult.rows.length === 0) {
        console.log(`⚠️  Skipping interaction for ${interaction.customer_name} - customer not found`);
        continue;
      }

      const customer_id = customerResult.rows[0].customer_id;

      // Insert interaction
      const insertQuery = `
        INSERT INTO interaction (
          interaction_type, subject, description, interaction_date,
          customer_id, contact_id, duration_minutes, direction,
          medium, outcome, sentiment, importance, location, private_notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING interaction_id, subject
      `;

      const values = [
        interaction.interaction_type,
        interaction.subject,
        interaction.description,
        interaction.interaction_date,
        customer_id,
        null, // contact_id
        interaction.duration_minutes,
        interaction.direction,
        interaction.medium,
        interaction.outcome,
        interaction.sentiment,
        interaction.importance,
        interaction.location,
        interaction.private_notes
      ];

      const result = await client.query(insertQuery, values);
      console.log(`✅ Added: ${result.rows[0].subject} (ID: ${result.rows[0].interaction_id})`);
    }

    console.log(`\n🎉 Successfully added ${testInteractions.length} test interactions!`);

  } catch (error) {
    console.error('❌ Error adding test interactions:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
addTestInteractions();
