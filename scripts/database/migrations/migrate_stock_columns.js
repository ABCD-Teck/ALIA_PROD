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

async function migrateStockColumns() {
  const client = await pool.connect();

  try {
    console.log('Starting stock column migration...');

    // Step 1: Check if stock_code column exists, if not create it
    const checkColumnQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'customer' AND column_name = 'stock_code'
    `;

    const columnCheck = await client.query(checkColumnQuery);

    if (columnCheck.rows.length === 0) {
      console.log('Creating stock_code column...');
      await client.query(`
        ALTER TABLE customer
        ADD COLUMN stock_code VARCHAR(20)
      `);
      console.log('✓ stock_code column created');
    } else {
      console.log('✓ stock_code column already exists');
    }

    // Step 2: Migrate data from stock_symbol to stock_code (only if stock_code is null)
    console.log('Migrating data from stock_symbol to stock_code...');
    const migrateResult = await client.query(`
      UPDATE customer
      SET stock_code = stock_symbol
      WHERE stock_symbol IS NOT NULL
        AND stock_code IS NULL
    `);
    console.log(`✓ Migrated ${migrateResult.rowCount} rows`);

    // Step 3: Show current data before deletion
    const dataCheck = await client.query(`
      SELECT customer_id, company_name, stock_symbol, stock_code
      FROM customer
      WHERE stock_symbol IS NOT NULL OR stock_code IS NOT NULL
      LIMIT 10
    `);

    console.log('\nCurrent data (first 10 rows with stock info):');
    console.table(dataCheck.rows);

    // Step 4: Check if stock_symbol column exists before dropping
    const checkStockSymbolQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'customer' AND column_name = 'stock_symbol'
    `;

    const stockSymbolCheck = await client.query(checkStockSymbolQuery);

    if (stockSymbolCheck.rows.length > 0) {
      console.log('\nDropping stock_symbol column...');
      await client.query(`
        ALTER TABLE customer
        DROP COLUMN stock_symbol
      `);
      console.log('✓ stock_symbol column removed');
    } else {
      console.log('✓ stock_symbol column already removed');
    }

    // Step 5: Verify final state
    const finalCheck = await client.query(`
      SELECT customer_id, company_name, stock_code
      FROM customer
      WHERE stock_code IS NOT NULL
      LIMIT 10
    `);

    console.log('\nFinal data (first 10 rows with stock_code):');
    console.table(finalCheck.rows);

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrateStockColumns().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
