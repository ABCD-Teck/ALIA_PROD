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

async function inspectArticles() {
  try {
    console.log('Connecting to MIA database...');

    // Get sample of recent articles with their buckets
    const query = `
      SELECT
        na.news_id,
        LEFT(na.title, 80) as title,
        na.top_bucket,
        na.top_bucket_score,
        na.importance,
        na.published_at::date
      FROM news_article na
      WHERE na.has_text = true
      ORDER BY na.published_at DESC
      LIMIT 50;
    `;

    const result = await miaPool.query(query);

    console.log(`\nFound ${result.rows.length} recent articles:\n`);
    console.log('ID'.padEnd(40) + ' | ' + 'Title'.padEnd(80) + ' | ' + 'Bucket'.padEnd(30) + ' | Score | Importance');
    console.log('-'.repeat(180));

    result.rows.forEach(row => {
      const id = row.news_id.substring(0, 36).padEnd(40);
      const title = (row.title || 'No title').padEnd(80);
      const bucket = (row.top_bucket || 'No bucket').padEnd(30);
      const score = (row.top_bucket_score || 0).toFixed(2).padEnd(5);
      const importance = row.importance || 'N/A';

      console.log(`${id} | ${title} | ${bucket} | ${score} | ${importance}`);
    });

    // Get bucket distribution
    console.log('\n\nBucket Distribution:');
    const bucketQuery = `
      SELECT
        top_bucket,
        COUNT(*) as count,
        AVG(top_bucket_score) as avg_score,
        MIN(top_bucket_score) as min_score
      FROM news_article
      WHERE has_text = true AND top_bucket IS NOT NULL
      GROUP BY top_bucket
      ORDER BY count DESC;
    `;

    const bucketResult = await miaPool.query(bucketQuery);
    bucketResult.rows.forEach(row => {
      console.log(`${row.top_bucket.padEnd(40)} | Count: ${row.count.toString().padEnd(6)} | Avg Score: ${parseFloat(row.avg_score).toFixed(3)} | Min Score: ${parseFloat(row.min_score).toFixed(3)}`);
    });

    // Find articles with low bucket scores (potential miscategorizations)
    console.log('\n\nArticles with LOW bucket scores (< 0.3):');
    const lowScoreQuery = `
      SELECT
        na.news_id,
        LEFT(na.title, 60) as title,
        na.top_bucket,
        na.top_bucket_score,
        na.published_at::date
      FROM news_article na
      WHERE na.has_text = true
        AND na.top_bucket_score < 0.3
      ORDER BY na.top_bucket_score ASC
      LIMIT 30;
    `;

    const lowScoreResult = await miaPool.query(lowScoreQuery);
    console.log(`\nFound ${lowScoreResult.rows.length} articles with low bucket scores:\n`);
    console.log('Score | Bucket'.padEnd(35) + ' | Title');
    console.log('-'.repeat(150));

    lowScoreResult.rows.forEach(row => {
      const score = row.top_bucket_score.toFixed(3);
      const bucket = (row.top_bucket || 'No bucket').substring(0, 25).padEnd(25);
      const title = row.title || 'No title';

      console.log(`${score} | ${bucket} | ${title}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await miaPool.end();
  }
}

inspectArticles();
