require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE_MIA,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function checkMIARegions() {
  try {
    console.log('=== MIA DATABASE REGIONS AND GEOGRAPHICAL DATA ===\n');

    // Get table structure
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('Available tables:', tables.rows.map(r => r.table_name).join(', '));
    console.log('\n');

    // Check news_article table structure
    const newsArticleSchema = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'news_article' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);

    console.log('NEWS_ARTICLE columns:');
    newsArticleSchema.rows.forEach(col => {
      if (col.column_name.includes('region') || col.column_name.includes('country') || col.column_name.includes('geo')) {
        console.log(`  **${col.column_name}: ${col.data_type}**`);
      } else {
        console.log(`  ${col.column_name}: ${col.data_type}`);
      }
    });

    // Get sample region data
    console.log('\n=== REGION DATA SAMPLES ===');
    const regionSamples = await pool.query(`
      SELECT DISTINCT primary_region, regions, countries
      FROM news_article
      WHERE primary_region IS NOT NULL
      LIMIT 10
    `);

    console.log('Sample regional data:');
    regionSamples.rows.forEach((row, i) => {
      console.log(`${i+1}. Primary: ${row.primary_region}, Regions: ${JSON.stringify(row.regions)}, Countries: ${JSON.stringify(row.countries)}`);
    });

    // Get unique regions
    console.log('\n=== ALL UNIQUE REGIONS ===');
    const uniqueRegions = await pool.query(`
      SELECT DISTINCT primary_region, COUNT(*) as count
      FROM news_article
      WHERE primary_region IS NOT NULL
      GROUP BY primary_region
      ORDER BY count DESC
    `);

    uniqueRegions.rows.forEach(row => {
      console.log(`${row.primary_region}: ${row.count} articles`);
    });

    // Get unique countries
    console.log('\n=== COUNTRIES DATA ===');
    const countriesSample = await pool.query(`
      SELECT DISTINCT countries
      FROM news_article
      WHERE countries IS NOT NULL AND array_length(countries, 1) > 0
      LIMIT 10
    `);

    console.log('Sample countries data:');
    countriesSample.rows.forEach((row, i) => {
      console.log(`${i+1}. Countries: ${JSON.stringify(row.countries)}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkMIARegions();