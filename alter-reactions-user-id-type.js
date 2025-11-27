const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const miaPool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE_MIA,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    console.log('Connecting to MIA database...\n');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'server', 'migrations', 'alter_user_article_reactions_user_id_type_mia.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing migration: alter_user_article_reactions_user_id_type_mia.sql\n');

    // Execute the migration
    await miaPool.query(sql);

    console.log('✓ Migration completed successfully!\n');
    console.log('Altered user_article_reactions.user_id column type from INTEGER to VARCHAR(255)');

  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    await miaPool.end();
  }
}

runMigration();
