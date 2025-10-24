require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE_ALIA,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function fixCustomerTypeAndStatus() {
  const client = await pool.connect();

  try {
    console.log('Analyzing current customer type and status values...\n');

    // Step 1: Check current values
    const currentValues = await client.query(`
      SELECT
        customer_type,
        status,
        COUNT(*) as count
      FROM customer
      GROUP BY customer_type, status
      ORDER BY count DESC
    `);

    console.log('Current customer_type and status combinations:');
    console.table(currentValues.rows);

    // Step 2: Show all unique values
    const uniqueTypes = await client.query(`
      SELECT DISTINCT customer_type FROM customer WHERE customer_type IS NOT NULL
    `);
    const uniqueStatuses = await client.query(`
      SELECT DISTINCT status FROM customer WHERE status IS NOT NULL
    `);

    console.log('\nUnique customer_type values:');
    uniqueTypes.rows.forEach(row => console.log(`  - ${row.customer_type}`));

    console.log('\nUnique status values:');
    uniqueStatuses.rows.forEach(row => console.log(`  - ${row.status}`));

    console.log('\n=== FIXING DATA CORRUPTION ===\n');

    // Step 3: Fix status field - should only be active, inactive, prospect
    // If status has values like 'SMB', 'enterprise', move them to customer_type
    console.log('Moving misplaced customer types from status field...');

    // Fix 'prospect' - this should be in status, not customer_type
    const fixProspectInType = await client.query(`
      UPDATE customer
      SET
        status = CASE
          WHEN customer_type IN ('prospect', 'active', 'inactive') THEN customer_type
          ELSE COALESCE(status, 'active')
        END,
        customer_type = CASE
          WHEN customer_type IN ('prospect', 'active', 'inactive') THEN NULL
          ELSE customer_type
        END
      WHERE customer_type IN ('prospect', 'active', 'inactive')
    `);
    console.log(`✓ Fixed ${fixProspectInType.rowCount} rows with status values in customer_type field`);

    // Fix customer type values that are in status field
    const fixTypeInStatus = await client.query(`
      UPDATE customer
      SET
        customer_type = CASE
          WHEN status NOT IN ('active', 'inactive', 'prospect') THEN status
          ELSE customer_type
        END,
        status = CASE
          WHEN status NOT IN ('active', 'inactive', 'prospect') THEN 'active'
          ELSE status
        END
      WHERE status NOT IN ('active', 'inactive', 'prospect')
    `);
    console.log(`✓ Fixed ${fixTypeInStatus.rowCount} rows with customer_type values in status field`);

    // Step 4: Set defaults for NULL values
    console.log('\nSetting defaults for NULL values...');

    const setDefaultStatus = await client.query(`
      UPDATE customer
      SET status = 'active'
      WHERE status IS NULL
    `);
    console.log(`✓ Set default status for ${setDefaultStatus.rowCount} rows`);

    // Step 5: Verify final state
    console.log('\n=== FINAL STATE ===\n');

    const finalValues = await client.query(`
      SELECT
        customer_type,
        status,
        COUNT(*) as count
      FROM customer
      GROUP BY customer_type, status
      ORDER BY status, customer_type
    `);

    console.log('Final customer_type and status combinations:');
    console.table(finalValues.rows);

    const finalTypes = await client.query(`
      SELECT DISTINCT customer_type FROM customer WHERE customer_type IS NOT NULL
    `);
    const finalStatuses = await client.query(`
      SELECT DISTINCT status FROM customer WHERE status IS NOT NULL
    `);

    console.log('\nFinal unique customer_type values:');
    finalTypes.rows.forEach(row => console.log(`  - ${row.customer_type}`));

    console.log('\nFinal unique status values (should only be active/inactive/prospect):');
    finalStatuses.rows.forEach(row => console.log(`  - ${row.status}`));

    // Step 6: Show sample data
    const sampleData = await client.query(`
      SELECT customer_id, company_name, customer_type, status
      FROM customer
      LIMIT 10
    `);

    console.log('\nSample customer data:');
    console.table(sampleData.rows);

    console.log('\n✅ Data corruption fixed successfully!');
    console.log('\nNOTE: Status should now only contain: active, inactive, prospect');
    console.log('Customer type can contain: SMB, Enterprise, or other business types');

  } catch (error) {
    console.error('❌ Fix failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixCustomerTypeAndStatus().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
