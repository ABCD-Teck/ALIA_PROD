require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    database: process.env.PGDATABASE_ALIA,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Updating annotation.status column to TEXT...');
    await client.query('ALTER TABLE annotation ALTER COLUMN status TYPE text');

    console.log('Ensuring 500-word limit constraint is present...');
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'annotation_status_word_limit'
        ) THEN
          ALTER TABLE annotation
          ADD CONSTRAINT annotation_status_word_limit
          CHECK (
            status IS NULL
            OR array_length(regexp_split_to_array(trim(status), '\\s+'), 1) <= 500
          );
        END IF;
      END
      $$;
    `);

    console.log('Annotation schema updated successfully.');
  } catch (error) {
    console.error('Failed to update annotation schema:', error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

run();
