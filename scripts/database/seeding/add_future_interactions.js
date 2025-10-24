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

async function addFutureInteractions() {
  try {
    console.log('\n=== Adding Future Interactions for Testing ===\n');

    // Get a customer ID first
    const customerResult = await pool.query(`
      SELECT customer_id FROM customer LIMIT 1
    `);

    if (customerResult.rows.length === 0) {
      console.error('No customers found in database');
      process.exit(1);
    }

    const customerId = customerResult.rows[0].customer_id;
    console.log(`Using customer ID: ${customerId}`);

    // Get a user ID for created_by
    const userResult = await pool.query(`
      SELECT user_id FROM "user" LIMIT 1
    `);

    const userId = userResult.rows.length > 0 ? userResult.rows[0].user_id : null;
    console.log(`Using user ID: ${userId || 'NULL'}`);

    // Future interactions with dates in 2025-2026
    const futureInteractions = [
      {
        type: 'visit',
        subject: 'Quarterly Business Review - Q2 2026',
        description: 'Scheduled quarterly review meeting to discuss performance and future plans',
        date: '2026-04-15T14:00:00Z',
        location: 'Client Office, Building A',
        direction: 'outbound',
        medium: 'in-person',
        outcome: 'pending',
        sentiment: 'neutral',
        importance: 4
      },
      {
        type: 'meeting',
        subject: 'Product Demo - New Feature Showcase',
        description: 'Demonstrate new product features and gather feedback',
        date: '2025-11-20T10:30:00Z',
        location: 'Virtual - Zoom',
        direction: 'outbound',
        medium: 'video',
        outcome: 'pending',
        sentiment: 'positive',
        importance: 3
      },
      {
        type: 'phone',
        subject: 'Follow-up Call - Contract Renewal',
        description: 'Discuss contract renewal terms and pricing',
        date: '2025-12-10T15:00:00Z',
        location: null,
        direction: 'outbound',
        medium: 'phone',
        outcome: 'pending',
        sentiment: 'neutral',
        importance: 5
      },
      {
        type: 'technical',
        subject: 'Technical Workshop - API Integration',
        description: 'Technical workshop for API integration best practices',
        date: '2026-01-25T09:00:00Z',
        location: 'Conference Center',
        direction: 'outbound',
        medium: 'in-person',
        outcome: 'pending',
        sentiment: 'positive',
        importance: 4
      },
      {
        type: 'marketing',
        subject: 'Industry Conference - Tech Summit 2026',
        description: 'Annual technology summit with keynote presentations',
        date: '2026-03-10T08:00:00Z',
        location: 'Convention Center',
        direction: 'outbound',
        medium: 'in-person',
        outcome: 'pending',
        sentiment: 'positive',
        importance: 3
      }
    ];

    for (const interaction of futureInteractions) {
      const query = `
        INSERT INTO interaction (
          interaction_type, subject, description, interaction_date,
          customer_id, location, direction, medium, outcome, sentiment, importance,
          created_by, updated_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING interaction_id, subject, interaction_date
      `;

      const values = [
        interaction.type,
        interaction.subject,
        interaction.description,
        interaction.date,
        customerId,
        interaction.location,
        interaction.direction,
        interaction.medium,
        interaction.outcome,
        interaction.sentiment,
        interaction.importance,
        userId,
        userId
      ];

      const result = await pool.query(query, values);
      console.log(`✅ Added: ${result.rows[0].subject}`);
      console.log(`   Date: ${new Date(result.rows[0].interaction_date).toLocaleString()}`);
      console.log(`   ID: ${result.rows[0].interaction_id}\n`);
    }

    // Verify counts
    const countResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE interaction_date < NOW()) as past_count,
        COUNT(*) FILTER (WHERE interaction_date >= NOW()) as future_count
      FROM interaction
    `);

    console.log('=== Verification ===');
    console.log(`Past interactions: ${countResult.rows[0].past_count}`);
    console.log(`Future interactions: ${countResult.rows[0].future_count}`);

    await pool.end();
    console.log('\n✅ Future interactions added successfully!');
  } catch (error) {
    console.error('❌ Error adding future interactions:', error);
    process.exit(1);
  }
}

addFutureInteractions();
