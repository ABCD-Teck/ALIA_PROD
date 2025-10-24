const { Pool } = require('pg');

const pool = new Pool({
  host: 'abcdteck-ce.cdggcuqweof7.eu-central-1.rds.amazonaws.com',
  port: 5432,
  database: 'alia_crm',
  user: 'postgres',
  password: 'ABCDTeck2025',
  ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
  try {
    // Get opportunities columns
    const oppCols = await pool.query(
      `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_name = 'opportunity'
       ORDER BY ordinal_position`
    );
    console.log('=== OPPORTUNITY TABLE COLUMNS ===');
    oppCols.rows.forEach(r =>
      console.log(`  ${r.column_name}: ${r.data_type} (nullable: ${r.is_nullable}, default: ${r.column_default})`)
    );

    // Get interactions columns
    const intCols = await pool.query(
      `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_name = 'interaction'
       ORDER BY ordinal_position`
    );
    console.log('\n=== INTERACTION TABLE COLUMNS ===');
    intCols.rows.forEach(r =>
      console.log(`  ${r.column_name}: ${r.data_type} (nullable: ${r.is_nullable}, default: ${r.column_default})`)
    );

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkSchema();
