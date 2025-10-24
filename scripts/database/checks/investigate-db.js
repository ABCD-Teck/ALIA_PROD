require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE_ALIA,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

async function investigateDatabase() {
  try {
    console.log('Connecting to database...');
    console.log(`Host: ${process.env.PGHOST}`);
    console.log(`Database: ${process.env.PGDATABASE_ALIA}`);
    console.log('\n');

    // Get all tables
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('=== TABLES IN ALIA_CRM DATABASE ===');
    console.log(tablesResult.rows.map(r => r.table_name).join('\n'));
    console.log('\n');

    // Get structure for each table
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;

      console.log(`\n=== TABLE: ${tableName.toUpperCase()} ===`);

      // Get columns
      const columnsResult = await pool.query(`
        SELECT
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);

      console.log('\nColumns:');
      columnsResult.rows.forEach(col => {
        let colInfo = `  - ${col.column_name}: ${col.data_type}`;
        if (col.character_maximum_length) {
          colInfo += `(${col.character_maximum_length})`;
        }
        if (col.is_nullable === 'NO') {
          colInfo += ' NOT NULL';
        }
        if (col.column_default) {
          colInfo += ` DEFAULT ${col.column_default}`;
        }
        console.log(colInfo);
      });

      // Get sample row count
      const countResult = await pool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
      console.log(`\nRow count: ${countResult.rows[0].count}`);

      // Get sample data (first 3 rows)
      if (parseInt(countResult.rows[0].count) > 0) {
        const sampleResult = await pool.query(`SELECT * FROM "${tableName}" LIMIT 3`);
        console.log('\nSample data (first 3 rows):');
        console.log(JSON.stringify(sampleResult.rows, null, 2));
      }
    }

  } catch (error) {
    console.error('Error investigating database:', error);
  } finally {
    await pool.end();
  }
}

investigateDatabase();
