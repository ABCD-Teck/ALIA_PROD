const { Pool } = require('pg');

const pool = new Pool({
  host: 'abcdteck-ce.cdggcuqweof7.eu-central-1.rds.amazonaws.com',
  port: 5432,
  database: 'alia_crm',
  user: 'postgres',
  password: 'ABCDTeck2025'
});

async function checkColumns() {
  try {
    console.log('Checking database connection...');
    const result = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'financial_statement'
      ORDER BY ordinal_position
    `);

    console.log('\nColumns in financial_statement table:');
    if (result.rows.length === 0) {
      console.log('  No columns found! Table may not exist.');
    } else {
      result.rows.forEach(row => {
        console.log(`  ${row.column_name}: ${row.data_type}`);
      });
    }

    await pool.end();
  } catch (error) {
    console.error('Error details:');
    console.error('  Message:', error.message);
    console.error('  Code:', error.code);
    console.error('  Stack:', error.stack);
    process.exit(1);
  }
}

checkColumns();
