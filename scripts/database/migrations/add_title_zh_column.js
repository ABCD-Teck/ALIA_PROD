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

async function addTitleZhColumn() {
  try {
    console.log('Adding title_zh column to news_article table...');

    await miaPool.query(`
      ALTER TABLE news_article
      ADD COLUMN IF NOT EXISTS title_zh TEXT;
    `);

    console.log('✅ Successfully added title_zh column');

    // Verify the column was added
    const result = await miaPool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'news_article' AND column_name = 'title_zh';
    `);

    if (result.rows.length > 0) {
      console.log(`✅ Verified: title_zh column exists with type ${result.rows[0].data_type}`);
    } else {
      console.log('⚠️  Warning: Could not verify title_zh column');
    }

    await miaPool.end();
  } catch (error) {
    console.error('❌ Error adding column:', error);
    process.exit(1);
  }
}

addTitleZhColumn();
