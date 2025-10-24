const { Pool } = require('pg');

const pool = new Pool({
  host: 'abcdteck-ce.cdggcuqweof7.eu-central-1.rds.amazonaws.com',
  port: 5432,
  database: 'alia_crm',
  user: 'postgres',
  password: 'ABCDTeck2025'
});

async function checkStructure() {
  try {
    // Get all tables
    const tables = await pool.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' ORDER BY table_name`
    );
    console.log('Tables:', tables.rows.map(r => r.table_name).join(', '));

    // Get opportunities columns
    const oppCols = await pool.query(
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns
       WHERE table_name = 'opportunities'
       ORDER BY ordinal_position`
    );
    console.log('\nOpportunities columns:');
    oppCols.rows.forEach(r =>
      console.log(`  ${r.column_name}: ${r.data_type} (nullable: ${r.is_nullable})`)
    );

    // Get interactions columns
    const intCols = await pool.query(
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns
       WHERE table_name = 'interactions'
       ORDER BY ordinal_position`
    );
    console.log('\nInteractions columns:');
    intCols.rows.forEach(r =>
      console.log(`  ${r.column_name}: ${r.data_type} (nullable: ${r.is_nullable})`)
    );

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkStructure();
