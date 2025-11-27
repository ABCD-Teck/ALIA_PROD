const { Pool } = require('pg');

const pool = new Pool({
  host: 'abcdteck-ce.cdggcuqweof7.eu-central-1.rds.amazonaws.com',
  port: 5432,
  database: 'alia_crm',
  user: 'postgres',
  password: 'ABCDTeck2025',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkAndFixCustomerTable() {
  try {
    console.log('Checking customer table schema...');

    // Check if is_active column exists
    const checkColumn = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'customer'
      AND column_name = 'is_active'
    `);

    if (checkColumn.rows.length === 0) {
      console.log('❌ is_active column is missing!');
      console.log('Adding is_active column to customer table...');

      await pool.query(`
        ALTER TABLE customer
        ADD COLUMN is_active BOOLEAN DEFAULT true NOT NULL
      `);

      console.log('✅ Successfully added is_active column');
    } else {
      console.log('✅ is_active column already exists');
    }

    // Display current customer table schema
    const schema = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'customer'
      ORDER BY ordinal_position
    `);

    console.log('\nCurrent customer table schema:');
    schema.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
    });

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkAndFixCustomerTable();
