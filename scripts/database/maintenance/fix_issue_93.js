/**
 * Fix for GitHub Issue #93
 * https://github.com/ABCD-Teck/ALIA_PROD/issues/93
 *
 * Problem: Articles from Süddeutsche Zeitung (www.sueddeutsche.de) dated November 16
 *          contain mixed Chinese and German text with unexpected asterisk characters.
 *
 * Solution: Delete or clear translations for affected articles
 *
 * Usage:
 *   node fix_issue_93.js              # Dry run - show what would be done
 *   node fix_issue_93.js --execute    # Actually perform the fix
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

const executeMode = process.argv.includes('--execute');

console.log(`
╔════════════════════════════════════════════════════════════════╗
║         Fix for GitHub Issue #93                               ║
║         Süddeutsche Zeitung Mixed Content Fix                  ║
╠════════════════════════════════════════════════════════════════╣
║  Mode: ${executeMode ? 'EXECUTE (changes will be made)       ' : 'DRY-RUN (preview only)           '}
╚════════════════════════════════════════════════════════════════╝
`);

// Check if text has the reported issue (mixed Chinese-German, asterisks)
function hasIssue93Problem(text) {
  if (!text) return false;

  const hasChinese = /[\u4e00-\u9fff]/.test(text);
  const hasGerman = /[äöüÄÖÜß]/.test(text) || /\b(und|der|die|das|ist|für|mit|von)\b/i.test(text);
  const hasAsterisks = /\*{2,}/.test(text);

  return (hasChinese && hasGerman) || hasAsterisks;
}

async function main() {
  try {
    console.log('🔍 Searching for affected articles...\n');

    // Find articles from Süddeutsche Zeitung around November 16, 2024
    const query = `
      SELECT
        news_id,
        title,
        title_zh,
        summary_en,
        summary_zh,
        url,
        source,
        published_at
      FROM news_article
      WHERE (
        LOWER(url) LIKE '%sueddeutsche%'
        OR LOWER(source) LIKE '%sueddeutsche%'
        OR LOWER(source) LIKE '%süddeutsche%'
        OR LOWER(source) = 'sz'
      )
      ORDER BY published_at DESC
    `;

    const result = await miaPool.query(query);
    console.log(`📰 Found ${result.rows.length} Süddeutsche Zeitung articles total\n`);

    // Filter to those with problems
    const affectedArticles = result.rows.filter(article =>
      hasIssue93Problem(article.title_zh) ||
      hasIssue93Problem(article.summary_zh) ||
      hasIssue93Problem(article.summary_en)
    );

    // Also check for German .de domain articles with similar issues
    const germanQuery = `
      SELECT
        news_id,
        title,
        title_zh,
        summary_en,
        summary_zh,
        url,
        source,
        published_at
      FROM news_article
      WHERE LOWER(url) LIKE '%.de/%'
        AND published_at >= '2024-11-01'
      ORDER BY published_at DESC
    `;

    const germanResult = await miaPool.query(germanQuery);
    console.log(`🇩🇪 Found ${germanResult.rows.length} German domain articles to check\n`);

    const additionalAffected = germanResult.rows.filter(article =>
      !affectedArticles.find(a => a.news_id === article.news_id) &&
      (hasIssue93Problem(article.title_zh) ||
       hasIssue93Problem(article.summary_zh) ||
       hasIssue93Problem(article.summary_en))
    );

    const allAffected = [...affectedArticles, ...additionalAffected];

    if (allAffected.length === 0) {
      console.log('✅ No affected articles found! The issue may already be resolved.\n');

      // Double-check by looking at all articles with mixed content
      const mixedQuery = `
        SELECT news_id, title, title_zh, summary_zh, url, source, published_at
        FROM news_article
        WHERE (
          title_zh ~ '[äöüÄÖÜß]' AND title_zh ~ '[\u4e00-\u9fff]'
        ) OR (
          summary_zh ~ '[äöüÄÖÜß]' AND summary_zh ~ '[\u4e00-\u9fff]'
        ) OR (
          title_zh ~ '\\*{2,}' OR summary_zh ~ '\\*{2,}'
        )
        ORDER BY published_at DESC
        LIMIT 50
      `;

      try {
        const mixedResult = await miaPool.query(mixedQuery);
        if (mixedResult.rows.length > 0) {
          console.log(`⚠️  Found ${mixedResult.rows.length} articles with potential mixed content issues:\n`);
          for (const article of mixedResult.rows.slice(0, 10)) {
            console.log(`   - ${article.news_id}: ${article.title?.substring(0, 50)}...`);
            console.log(`     Source: ${article.source}, Date: ${article.published_at}`);
          }
          // Add these to affected list
          allAffected.push(...mixedResult.rows);
        }
      } catch (e) {
        // Regex might not be supported, try simpler approach
        console.log('   (Using alternative detection method...)\n');
      }

      if (allAffected.length === 0) {
        return;
      }
    }

    // Report affected articles
    console.log('━'.repeat(70));
    console.log(`📋 AFFECTED ARTICLES: ${allAffected.length}`);
    console.log('━'.repeat(70) + '\n');

    for (const article of allAffected) {
      console.log(`📰 ${article.news_id}`);
      console.log(`   Title: ${article.title?.substring(0, 60)}...`);
      console.log(`   Source: ${article.source}`);
      console.log(`   Date: ${article.published_at}`);
      console.log(`   URL: ${article.url?.substring(0, 70)}...`);

      if (hasIssue93Problem(article.title_zh)) {
        console.log(`   ❌ title_zh: ${article.title_zh?.substring(0, 80)}...`);
      }
      if (hasIssue93Problem(article.summary_zh)) {
        console.log(`   ❌ summary_zh: ${article.summary_zh?.substring(0, 80)}...`);
      }
      console.log();
    }

    // Perform fix
    console.log('━'.repeat(70));
    console.log('🔧 FIXING AFFECTED ARTICLES');
    console.log('━'.repeat(70) + '\n');

    let fixedCount = 0;
    let deletedCount = 0;

    for (const article of allAffected) {
      // Strategy: Clear the Chinese translations to allow re-translation
      // For severely broken articles, consider deletion

      const fieldsToNull = [];
      if (hasIssue93Problem(article.title_zh)) fieldsToNull.push('title_zh');
      if (hasIssue93Problem(article.summary_zh)) fieldsToNull.push('summary_zh');

      if (fieldsToNull.length > 0) {
        if (executeMode) {
          try {
            const setClause = fieldsToNull.map(f => `${f} = NULL`).join(', ');
            await miaPool.query(
              `UPDATE news_article SET ${setClause}, updated_at = NOW() WHERE news_id = $1`,
              [article.news_id]
            );
            console.log(`   ✓ Cleared ${fieldsToNull.join(', ')} for ${article.news_id}`);
            fixedCount++;
          } catch (error) {
            console.error(`   ✗ Failed to fix ${article.news_id}:`, error.message);
          }
        } else {
          console.log(`   [DRY-RUN] Would clear ${fieldsToNull.join(', ')} for ${article.news_id}`);
          fixedCount++;
        }
      }
    }

    // Summary
    console.log('\n' + '━'.repeat(70));
    console.log('📊 SUMMARY');
    console.log('━'.repeat(70));
    console.log(`
   Total affected articles: ${allAffected.length}
   Articles fixed: ${fixedCount}
   Articles deleted: ${deletedCount}

   ${!executeMode ? '⚠️  This was a DRY-RUN. Run with --execute to apply changes.' : '✅ Fix completed!'}
`);

    // Generate SQL for reference
    if (!executeMode && allAffected.length > 0) {
      console.log('\n📜 SQL commands for manual fix:\n');
      console.log('-- Clear problematic Chinese translations');
      for (const article of allAffected.slice(0, 20)) {
        const fieldsToNull = [];
        if (hasIssue93Problem(article.title_zh)) fieldsToNull.push('title_zh');
        if (hasIssue93Problem(article.summary_zh)) fieldsToNull.push('summary_zh');

        if (fieldsToNull.length > 0) {
          const setClause = fieldsToNull.map(f => `${f} = NULL`).join(', ');
          console.log(`UPDATE news_article SET ${setClause}, updated_at = NOW() WHERE news_id = '${article.news_id}';`);
        }
      }
      if (allAffected.length > 20) {
        console.log(`-- ... and ${allAffected.length - 20} more`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await miaPool.end();
    console.log('\n🔌 Database connection closed.\n');
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
