require('dotenv').config();
const { Pool } = require('pg');

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

async function createTestInteraction() {
  try {
    // Get Apple's customer_id
    const customerQuery = `
      SELECT customer_id FROM customer WHERE company_name = 'Apple' LIMIT 1
    `;
    const customerResult = await pool.query(customerQuery);

    if (customerResult.rows.length === 0) {
      console.log('Apple customer not found');
      return;
    }

    const customerId = customerResult.rows[0].customer_id;
    console.log('Apple customer_id:', customerId);

    // Get a user_id for created_by
    const userQuery = `SELECT user_id FROM "user" LIMIT 1`;
    const userResult = await pool.query(userQuery);
    const userId = userResult.rows[0].user_id;
    console.log('User ID for created_by:', userId);

    // Create a test interaction
    const insertQuery = `
      INSERT INTO interaction (
        customer_id,
        interaction_type,
        interaction_date,
        subject,
        description,
        outcome,
        follow_up_date,
        medium,
        direction,
        duration_minutes,
        private_notes,
        created_by,
        updated_by
      ) VALUES (
        $1,
        '客户拜访',
        '2025-10-20',
        'Discussion about new product integration',
        'Met with the product team to discuss potential integration of our CRM system with their enterprise solutions. They showed strong interest in our AI-powered analytics features. Follow-up meeting scheduled to present detailed technical specifications.',
        'Positive - They agreed to a technical review meeting',
        '2025-10-27',
        'In-person',
        'Outbound',
        120,
        'Participants: John Smith (CEO), Sarah Johnson (CTO), Michael Chen (Product Manager)',
        $2,
        $2
      )
      RETURNING *
    `;

    const insertResult = await pool.query(insertQuery, [customerId, userId]);
    console.log('\n=== Test Interaction Created ===');
    console.log(JSON.stringify(insertResult.rows[0], null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

createTestInteraction();
