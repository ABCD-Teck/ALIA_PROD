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
    const sqlPath = path.join(__dirname, 'server', 'migrations', 'create_user_article_reactions_table_mia.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing migration: create_user_article_reactions_table_mia.sql\n');

    // Execute the migration
    await miaPool.query(sql);

    console.log('✓ Migration completed successfully!\n');
    console.log('Created table: user_article_reactions');
    console.log('  - Columns: id, user_id, article_id, reaction_type, created_at, updated_at');
    console.log('  - Reaction types: like, bookmark');
    console.log('  - Constraint: unique per user/article/reaction_type');
    console.log('  - Indexes: article, user, user+article\n');

    // Verify table was created
    const result = await miaPool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'user_article_reactions'
      ORDER BY ordinal_position;
    `);

    console.log('Table schema verification:');
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    await miaPool.end();
  }
}

runMigration();
