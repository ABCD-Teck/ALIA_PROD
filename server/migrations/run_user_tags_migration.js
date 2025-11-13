const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE_MIA, // Use MIA database for market insights
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('Running user_article_tags table migration...');

    const sqlPath = path.join(__dirname, 'create_user_article_tags_table_mia.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await client.query(sql);

    console.log('✅ Migration completed successfully!');
    console.log('Table user_article_tags has been created.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
