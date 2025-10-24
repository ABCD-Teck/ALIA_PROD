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

async function checkSchema() {
  try {
    const query = `
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'interaction'
      ORDER BY ordinal_position
    `;
    const result = await pool.query(query);
    console.log('\n=== Interaction Table Schema ===');
    result.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type}`);
    });

    // Also check if there are any existing interactions for Apple
    const interactionQuery = `
      SELECT i.*
      FROM interaction i
      JOIN customer c ON i.customer_id = c.customer_id
      WHERE c.company_name = 'Apple'
      LIMIT 5
    `;
    const interactionResult = await pool.query(interactionQuery);
    console.log('\n=== Existing Apple Interactions ===');
    console.log(JSON.stringify(interactionResult.rows, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkSchema();
