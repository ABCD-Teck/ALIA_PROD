const { Pool } = require('pg');
require('dotenv').config();

const miaPool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE_MIA,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
  try {
    // Check table columns
    const result = await miaPool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'news_article'
      ORDER BY ordinal_position;
    `);

    console.log('\n=== news_article Table Schema ===\n');
    result.rows.forEach(row => {
      console.log(`${row.column_name.padEnd(30)} ${row.data_type.padEnd(20)} ${row.is_nullable}`);
    });

    // Check if title_zh column exists
    const titleZhExists = result.rows.some(row => row.column_name === 'title_zh');
    const summaryZhExists = result.rows.some(row => row.column_name === 'summary_zh');

    console.log(`\n=== Translation Columns ===`);
    console.log(`title_zh exists: ${titleZhExists}`);
    console.log(`summary_zh exists: ${summaryZhExists}`);

    await miaPool.end();
  } catch (error) {
    console.error('Error checking schema:', error);
    process.exit(1);
  }
}

checkSchema();
