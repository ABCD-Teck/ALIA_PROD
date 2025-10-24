const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('./db');

async function runMigration() {
  try {
    console.log('Reading migration file...');
    const migrationPath = path.join(__dirname, 'migrations', 'create_document_table.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running migration...');
    await pool.query(migration);

    console.log('✅ Migration completed successfully!');
    console.log('Document table created.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
