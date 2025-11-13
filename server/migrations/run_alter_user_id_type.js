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
    console.log('Running user_id type alteration migration...');

    const sqlPath = path.join(__dirname, 'alter_user_article_tags_user_id_type.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await client.query(sql);

    console.log('✅ Migration completed successfully!');
    console.log('user_article_tags.user_id column has been changed to VARCHAR(255).');
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
