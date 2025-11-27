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

async function cleanupArticles() {
  try {
    console.log('Connecting to MIA database...\n');

    // Step 1: Count articles to be deleted
    const countQuery = `
      SELECT COUNT(*) as count
      FROM news_article
      WHERE has_text = true
        AND (
          top_bucket_score = 0
          OR top_bucket IS NULL
          OR top_bucket = 'No bucket'
          OR (importance <= 1 AND top_bucket_score < 0.5)
        );
    `;

    const countResult = await miaPool.query(countQuery);
    const articleCount = parseInt(countResult.rows[0].count);

    console.log(`Found ${articleCount} articles to delete based on criteria:`);
    console.log('  - Articles with bucket score = 0 (no confidence)');
    console.log('  - Articles with no bucket assigned');
    console.log('  - Low importance (≤1) articles with low bucket score (<0.5)\n');

    // Step 2: Get sample of articles to be deleted
    const sampleQuery = `
      SELECT
        news_id,
        LEFT(title, 70) as title,
        top_bucket,
        top_bucket_score,
        importance
      FROM news_article
      WHERE has_text = true
        AND (
          top_bucket_score = 0
          OR top_bucket IS NULL
          OR top_bucket = 'No bucket'
          OR (importance <= 1 AND top_bucket_score < 0.5)
        )
      LIMIT 20;
    `;

    const sampleResult = await miaPool.query(sampleQuery);
    console.log('Sample of articles to be deleted:\n');
    console.log('Title'.padEnd(72) + ' | Bucket'.padEnd(30) + ' | Score | Imp');
    console.log('-'.repeat(130));

    sampleResult.rows.forEach(row => {
      const title = (row.title || 'No title').padEnd(70);
      const bucket = (row.top_bucket || 'No bucket').substring(0, 28).padEnd(28);
      const score = (row.top_bucket_score || 0).toFixed(2);
      const importance = row.importance || 'N/A';

      console.log(`${title} | ${bucket} | ${score}  | ${importance}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log(`READY TO DELETE ${articleCount} miscategorized articles`);
    console.log('='.repeat(80) + '\n');

    // Step 3: DELETE articles
    console.log('Executing DELETE operation...\n');

    const deleteQuery = `
      DELETE FROM news_article
      WHERE has_text = true
        AND (
          top_bucket_score = 0
          OR top_bucket IS NULL
          OR top_bucket = 'No bucket'
          OR (importance <= 1 AND top_bucket_score < 0.5)
        )
      RETURNING news_id;
    `;

    const deleteResult = await miaPool.query(deleteQuery);

    console.log(`✓ Successfully deleted ${deleteResult.rows.length} articles\n`);

    // Step 4: Show updated statistics
    const statsQuery = `
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE top_bucket_score >= 0.5) as high_quality,
        AVG(top_bucket_score) as avg_score,
        MIN(top_bucket_score) as min_score
      FROM news_article
      WHERE has_text = true;
    `;

    const statsResult = await miaPool.query(statsQuery);
    const stats = statsResult.rows[0];

    console.log('Updated Database Statistics:');
    console.log(`  Total articles remaining: ${stats.total}`);
    console.log(`  High quality articles (score ≥ 0.5): ${stats.high_quality}`);
    console.log(`  Average bucket score: ${parseFloat(stats.avg_score).toFixed(3)}`);
    console.log(`  Minimum bucket score: ${parseFloat(stats.min_score).toFixed(3)}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await miaPool.end();
  }
}

cleanupArticles();
