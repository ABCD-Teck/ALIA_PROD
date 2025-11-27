/**
 * Check Süddeutsche Zeitung data for Chinese-German mixed text issues
 * Related to GitHub Issue #93
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const { Pool } = require('pg');

const miaPool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE_MIA,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false }
});

// Check if text contains Chinese characters
function containsChinese(text) {
  if (!text) return false;
  return /[\u4e00-\u9fff]/.test(text);
}

// Check if text contains German-specific characters or words
function containsGerman(text) {
  if (!text) return false;
  // German umlauts, sharp S, and common German words
  return /[äöüÄÖÜß]/.test(text) || /\b(und|der|die|das|ist|für|mit|von|zu|auf|bei)\b/i.test(text);
}

// Check for mixed Chinese and German content
function hasMixedContent(text) {
  if (!text) return false;
  return containsChinese(text) && containsGerman(text);
}

// Check for asterisk formatting issues
function hasAsteriskIssues(text) {
  if (!text) return false;
  // Unusual asterisk patterns that might indicate formatting problems
  return /\*{2,}/.test(text) || /\*\s*\*/.test(text);
}

async function checkData() {
  try {
    console.log('Connecting to MIA database...\n');

    // First, check all sources in the database
    console.log('=== Available News Sources ===\n');
    const sourcesResult = await miaPool.query(`
      SELECT DISTINCT source, COUNT(*) as count
      FROM news_article
      GROUP BY source
      ORDER BY count DESC
    `);
    console.table(sourcesResult.rows);

    // Query for sueddeutsche.de articles
    console.log('\n=== Checking Süddeutsche Zeitung Articles ===\n');
    const result = await miaPool.query(`
      SELECT news_id, title, title_zh, summary_en, summary_zh, url, source, published_at
      FROM news_article
      WHERE LOWER(url) LIKE '%sueddeutsche%'
         OR LOWER(source) LIKE '%sueddeutsche%'
         OR LOWER(source) LIKE '%süddeutsche%'
      ORDER BY published_at DESC
    `);

    console.log(`Found ${result.rows.length} articles from Süddeutsche Zeitung\n`);

    if (result.rows.length === 0) {
      // Check for any German source
      console.log('No Süddeutsche articles found. Checking for any German sources...\n');
      const germanResult = await miaPool.query(`
        SELECT news_id, title, title_zh, summary_en, summary_zh, url, source, published_at
        FROM news_article
        WHERE LOWER(url) LIKE '%.de%'
        ORDER BY published_at DESC
        LIMIT 50
      `);
      console.log(`Found ${germanResult.rows.length} articles from .de domains\n`);
      result.rows = germanResult.rows;
    }

    // Analyze each article
    const issues = [];

    for (const article of result.rows) {
      const articleIssues = [];

      // Check title_zh for mixed content
      if (hasMixedContent(article.title_zh)) {
        articleIssues.push({
          field: 'title_zh',
          issue: 'Mixed Chinese-German content',
          sample: article.title_zh?.substring(0, 100)
        });
      }

      // Check summary_zh for mixed content
      if (hasMixedContent(article.summary_zh)) {
        articleIssues.push({
          field: 'summary_zh',
          issue: 'Mixed Chinese-German content',
          sample: article.summary_zh?.substring(0, 100)
        });
      }

      // Check for asterisk issues
      if (hasAsteriskIssues(article.title_zh) || hasAsteriskIssues(article.summary_zh)) {
        articleIssues.push({
          field: hasAsteriskIssues(article.title_zh) ? 'title_zh' : 'summary_zh',
          issue: 'Asterisk formatting issues',
          sample: (hasAsteriskIssues(article.title_zh) ? article.title_zh : article.summary_zh)?.substring(0, 100)
        });
      }

      // Check if Chinese translation contains German text without proper translation
      if (article.summary_zh && containsGerman(article.summary_zh) && !containsChinese(article.summary_zh)) {
        articleIssues.push({
          field: 'summary_zh',
          issue: 'German text not translated to Chinese',
          sample: article.summary_zh?.substring(0, 100)
        });
      }

      if (articleIssues.length > 0) {
        issues.push({
          news_id: article.news_id,
          title: article.title?.substring(0, 50),
          url: article.url,
          source: article.source,
          published_at: article.published_at,
          problems: articleIssues
        });
      }
    }

    // Also check for any articles with mixed content regardless of source
    console.log('\n=== Checking ALL Articles for Mixed Chinese-German Content ===\n');
    const allArticlesResult = await miaPool.query(`
      SELECT news_id, title, title_zh, summary_en, summary_zh, url, source, published_at
      FROM news_article
      WHERE published_at >= '2024-11-01'
      ORDER BY published_at DESC
    `);

    console.log(`Checking ${allArticlesResult.rows.length} recent articles...\n`);

    for (const article of allArticlesResult.rows) {
      // Skip if already in issues list
      if (issues.find(i => i.news_id === article.news_id)) continue;

      const articleIssues = [];

      if (hasMixedContent(article.title_zh)) {
        articleIssues.push({
          field: 'title_zh',
          issue: 'Mixed Chinese-German content',
          sample: article.title_zh?.substring(0, 100)
        });
      }

      if (hasMixedContent(article.summary_zh)) {
        articleIssues.push({
          field: 'summary_zh',
          issue: 'Mixed Chinese-German content',
          sample: article.summary_zh?.substring(0, 100)
        });
      }

      if (hasAsteriskIssues(article.title_zh) || hasAsteriskIssues(article.summary_zh)) {
        articleIssues.push({
          field: hasAsteriskIssues(article.title_zh) ? 'title_zh' : 'summary_zh',
          issue: 'Asterisk formatting issues',
          sample: (hasAsteriskIssues(article.title_zh) ? article.title_zh : article.summary_zh)?.substring(0, 100)
        });
      }

      if (articleIssues.length > 0) {
        issues.push({
          news_id: article.news_id,
          title: article.title?.substring(0, 50),
          url: article.url,
          source: article.source,
          published_at: article.published_at,
          problems: articleIssues
        });
      }
    }

    // Report findings
    console.log('\n========== ISSUES FOUND ==========\n');

    if (issues.length === 0) {
      console.log('No mixed content issues found!');
    } else {
      console.log(`Found ${issues.length} articles with issues:\n`);

      for (const issue of issues) {
        console.log(`\n--- Article: ${issue.news_id} ---`);
        console.log(`Title: ${issue.title}`);
        console.log(`Source: ${issue.source}`);
        console.log(`URL: ${issue.url}`);
        console.log(`Published: ${issue.published_at}`);
        console.log('Problems:');
        for (const problem of issue.problems) {
          console.log(`  - ${problem.field}: ${problem.issue}`);
          console.log(`    Sample: ${problem.sample}`);
        }
      }

      // Output IDs for cleanup
      console.log('\n\n========== IDs FOR CLEANUP ==========\n');
      console.log('const issueIds = [');
      issues.forEach(i => console.log(`  '${i.news_id}',`));
      console.log('];');
    }

  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await miaPool.end();
    console.log('\n\nDatabase connection closed.');
  }
}

checkData();
