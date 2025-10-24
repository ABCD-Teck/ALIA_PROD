const { Pool } = require('pg');
require('dotenv').config();

const miaPool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE_MIA,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function verifyTranslations() {
  try {
    console.log('\n=== Verifying News Article Translations ===\n');

    // Check how many articles have title_zh
    const countResult = await miaPool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(title_zh) as with_title_zh,
        COUNT(summary_zh) as with_summary_zh
      FROM news_article;
    `);

    console.log('Translation Statistics:');
    console.log(`Total articles: ${countResult.rows[0].total}`);
    console.log(`Articles with title_zh: ${countResult.rows[0].with_title_zh}`);
    console.log(`Articles with summary_zh: ${countResult.rows[0].with_summary_zh}`);

    // Show some recent translations
    const sampleResult = await miaPool.query(`
      SELECT news_id,
             LEFT(title, 50) as title_preview,
             LEFT(title_zh, 50) as title_zh_preview,
             updated_at
      FROM news_article
      WHERE title_zh IS NOT NULL
      ORDER BY updated_at DESC
      LIMIT 10;
    `);

    console.log('\n=== Recent Translations (Last 10) ===\n');
    sampleResult.rows.forEach((row, idx) => {
      console.log(`${idx + 1}. ${row.news_id}`);
      console.log(`   EN: ${row.title_preview}...`);
      console.log(`   ZH: ${row.title_zh_preview}...`);
      console.log(`   Updated: ${row.updated_at}`);
      console.log('');
    });

    await miaPool.end();
    console.log('✅ Verification complete!');
  } catch (error) {
    console.error('❌ Error verifying translations:', error);
    process.exit(1);
  }
}

verifyTranslations();
