const { Pool } = require('pg');

const pool = new Pool({
  host: 'abcdteck-ce.cdggcuqweof7.eu-central-1.rds.amazonaws.com',
  port: 5432,
  database: 'mia_insights',
  user: 'postgres',
  password: 'ABCDTeck2025',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkNews() {
  try {
    // Get latest news articles
    const latestQuery = `
      SELECT
        news_id,
        title,
        published_at,
        source,
        created_at
      FROM news_article
      ORDER BY published_at DESC
      LIMIT 20;
    `;

    const result = await pool.query(latestQuery);

    console.log('\n========== LATEST NEWS ARTICLES ==========\n');
    console.log(`Total articles found: ${result.rows.length}\n`);

    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. [${row.news_id}] ${row.title}`);
      console.log(`   Published: ${row.published_at}`);
      console.log(`   Source: ${row.source}`);
      console.log(`   Created in DB: ${row.created_at}`);
      console.log('');
    });

    // Get count of articles by month
    const monthlyQuery = `
      SELECT
        TO_CHAR(published_at, 'YYYY-MM') as month,
        COUNT(*) as count
      FROM news_article
      WHERE published_at IS NOT NULL
      GROUP BY TO_CHAR(published_at, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12;
    `;

    const monthlyResult = await pool.query(monthlyQuery);

    console.log('\n========== ARTICLES BY MONTH ==========\n');
    monthlyResult.rows.forEach(row => {
      console.log(`${row.month}: ${row.count} articles`);
    });

    // Get the most recent published date
    const maxDateQuery = `
      SELECT
        MAX(published_at) as latest_published,
        MIN(published_at) as earliest_published,
        COUNT(*) as total_articles
      FROM news_article
      WHERE published_at IS NOT NULL;
    `;

    const statsResult = await pool.query(maxDateQuery);

    console.log('\n========== STATISTICS ==========\n');
    console.log(`Total articles: ${statsResult.rows[0].total_articles}`);
    console.log(`Latest published date: ${statsResult.rows[0].latest_published}`);
    console.log(`Earliest published date: ${statsResult.rows[0].earliest_published}`);

    await pool.end();

  } catch (error) {
    console.error('Error checking news:', error);
    process.exit(1);
  }
}

checkNews();
