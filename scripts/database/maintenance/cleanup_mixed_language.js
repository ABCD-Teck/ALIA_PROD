/**
 * Cleanup Mixed Language Content in Market Insights
 *
 * This script addresses GitHub Issue #93:
 * - Articles from Süddeutsche Zeitung (sueddeutsche.de) contain mixed Chinese-German text
 * - Unexpected asterisk characters in summaries
 *
 * Actions:
 * 1. Identify articles with mixed Chinese-German content
 * 2. Clear problematic translations (set to NULL for re-translation)
 * 3. Option to delete articles that cannot be fixed
 *
 * Usage:
 *   node cleanup_mixed_language.js              # Dry run (default)
 *   node cleanup_mixed_language.js --execute    # Actually perform cleanup
 *   node cleanup_mixed_language.js --delete     # Delete problematic articles
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

// Parse command line arguments
const args = process.argv.slice(2);
const executeMode = args.includes('--execute');
const deleteMode = args.includes('--delete');
const verboseMode = args.includes('--verbose') || args.includes('-v');

console.log(`
╔══════════════════════════════════════════════════════════════╗
║     Mixed Language Content Cleanup Script                    ║
║     Issue #93: Chinese-German Mixed Text Fix                 ║
╠══════════════════════════════════════════════════════════════╣
║  Mode: ${executeMode ? 'EXECUTE (changes will be made)' : 'DRY-RUN (no changes)'}
║  Delete problematic articles: ${deleteMode ? 'YES' : 'NO'}
║  Verbose: ${verboseMode ? 'YES' : 'NO'}
╚══════════════════════════════════════════════════════════════╝
`);

// ====== Text Analysis Functions ======

// Check if text contains Chinese characters
function containsChinese(text) {
  if (!text) return false;
  return /[\u4e00-\u9fff]/.test(text);
}

// Check if text contains German-specific characters or words
function containsGerman(text) {
  if (!text) return false;
  // German umlauts, sharp S, and common German words
  const hasUmlauts = /[äöüÄÖÜß]/.test(text);
  const hasGermanWords = /\b(und|der|die|das|ist|für|mit|von|zu|auf|bei|nicht|ein|eine|auch|sich|haben|werden|als|nach|wie|dem|den|werden|kann|sind|aus|noch|hat|nur|über|mehr|sein|so|war|sehr|schon|dann|aber|wenn|jetzt|immer|gegen|seit|bis|unter|weil|dabei|während|sowie)\b/i.test(text);
  return hasUmlauts || hasGermanWords;
}

// Check for mixed Chinese and German content
function hasMixedContent(text) {
  if (!text) return false;
  return containsChinese(text) && containsGerman(text);
}

// Check for asterisk formatting issues
function hasAsteriskIssues(text) {
  if (!text) return false;
  // Multiple asterisks together or spaced asterisks (markdown issues)
  return /\*{3,}/.test(text) || /\*\s+\*/.test(text);
}

// Check for incomplete/garbage translation
function hasGarbageTranslation(text) {
  if (!text) return false;
  // Check for common garbage patterns
  const patterns = [
    /\*\*[\u4e00-\u9fff]+\*\*/,  // Chinese in markdown bold that looks broken
    /[A-Za-z]+[\u4e00-\u9fff]+[A-Za-z]+/,  // Mixed inline
    /[\u4e00-\u9fff]+[äöüÄÖÜß]+/,  // Chinese directly next to German umlauts
    /[äöüÄÖÜß]+[\u4e00-\u9fff]+/,  // German umlauts directly next to Chinese
  ];
  return patterns.some(p => p.test(text));
}

// Analyze text and return issue details
function analyzeText(text, fieldName) {
  if (!text) return null;

  const issues = [];

  if (hasMixedContent(text)) {
    issues.push('mixed_chinese_german');
  }

  if (hasAsteriskIssues(text)) {
    issues.push('asterisk_formatting');
  }

  if (hasGarbageTranslation(text)) {
    issues.push('garbage_translation');
  }

  // Check if Chinese field contains mostly German (failed translation)
  if (fieldName.includes('_zh') && containsGerman(text) && !containsChinese(text)) {
    issues.push('untranslated_german');
  }

  return issues.length > 0 ? { field: fieldName, issues, sample: text.substring(0, 150) } : null;
}

// ====== Main Functions ======

async function findProblematicArticles() {
  console.log('\n📊 Scanning database for problematic articles...\n');

  // Query all recent articles, especially from German sources
  const query = `
    SELECT
      news_id,
      title,
      title_zh,
      summary_en,
      summary_zh,
      url,
      source,
      published_at,
      text
    FROM news_article
    WHERE published_at >= '2024-10-01'
    ORDER BY published_at DESC
  `;

  const result = await miaPool.query(query);
  console.log(`Found ${result.rows.length} articles to analyze\n`);

  const problematicArticles = [];

  for (const article of result.rows) {
    const problems = [];

    // Analyze each text field
    const titleZhAnalysis = analyzeText(article.title_zh, 'title_zh');
    if (titleZhAnalysis) problems.push(titleZhAnalysis);

    const summaryZhAnalysis = analyzeText(article.summary_zh, 'summary_zh');
    if (summaryZhAnalysis) problems.push(summaryZhAnalysis);

    const summaryEnAnalysis = analyzeText(article.summary_en, 'summary_en');
    if (summaryEnAnalysis) problems.push(summaryEnAnalysis);

    // Special check for sueddeutsche.de articles
    const isSueddeutsche = article.url?.toLowerCase().includes('sueddeutsche') ||
                           article.source?.toLowerCase().includes('sueddeutsche') ||
                           article.source?.toLowerCase().includes('süddeutsche');

    if (problems.length > 0) {
      problematicArticles.push({
        news_id: article.news_id,
        title: article.title,
        source: article.source,
        url: article.url,
        published_at: article.published_at,
        is_sueddeutsche: isSueddeutsche,
        problems
      });
    }
  }

  // Also specifically search for sueddeutsche articles
  const sueddeutscheQuery = `
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
    WHERE LOWER(url) LIKE '%sueddeutsche%'
       OR LOWER(source) LIKE '%sueddeutsche%'
       OR LOWER(source) LIKE '%süddeutsche%'
    ORDER BY published_at DESC
  `;

  const sueddeutscheResult = await miaPool.query(sueddeutscheQuery);
  console.log(`Found ${sueddeutscheResult.rows.length} Süddeutsche Zeitung articles\n`);

  // Add any sueddeutsche articles not already in the list
  for (const article of sueddeutscheResult.rows) {
    if (!problematicArticles.find(a => a.news_id === article.news_id)) {
      const problems = [];

      const titleZhAnalysis = analyzeText(article.title_zh, 'title_zh');
      if (titleZhAnalysis) problems.push(titleZhAnalysis);

      const summaryZhAnalysis = analyzeText(article.summary_zh, 'summary_zh');
      if (summaryZhAnalysis) problems.push(summaryZhAnalysis);

      if (problems.length > 0) {
        problematicArticles.push({
          news_id: article.news_id,
          title: article.title,
          source: article.source,
          url: article.url,
          published_at: article.published_at,
          is_sueddeutsche: true,
          problems
        });
      }
    }
  }

  return problematicArticles;
}

async function clearTranslations(articles) {
  console.log('\n🔧 Clearing problematic translations...\n');

  let cleared = 0;
  let failed = 0;

  for (const article of articles) {
    const fieldsToNull = [];

    for (const problem of article.problems) {
      if (problem.field === 'title_zh' || problem.field === 'summary_zh') {
        if (!fieldsToNull.includes(problem.field)) {
          fieldsToNull.push(problem.field);
        }
      }
    }

    if (fieldsToNull.length === 0) continue;

    const setClause = fieldsToNull.map(f => `${f} = NULL`).join(', ');
    const query = `UPDATE news_article SET ${setClause}, updated_at = NOW() WHERE news_id = $1`;

    if (executeMode) {
      try {
        await miaPool.query(query, [article.news_id]);
        cleared++;
        if (verboseMode) {
          console.log(`  ✓ Cleared ${fieldsToNull.join(', ')} for article ${article.news_id}`);
        }
      } catch (error) {
        failed++;
        console.error(`  ✗ Failed to clear article ${article.news_id}:`, error.message);
      }
    } else {
      console.log(`  [DRY-RUN] Would clear ${fieldsToNull.join(', ')} for article ${article.news_id}`);
      cleared++;
    }
  }

  return { cleared, failed };
}

async function deleteArticles(articles) {
  console.log('\n🗑️  Deleting problematic articles...\n');

  let deleted = 0;
  let failed = 0;

  for (const article of articles) {
    // Only delete articles with severe issues
    const severeIssues = article.problems.some(p =>
      p.issues.includes('garbage_translation') ||
      (p.issues.includes('mixed_chinese_german') && article.is_sueddeutsche)
    );

    if (!severeIssues) continue;

    if (executeMode && deleteMode) {
      try {
        // First delete from related tables
        await miaPool.query('DELETE FROM article_tag WHERE news_id = $1', [article.news_id]);
        await miaPool.query('DELETE FROM user_article_reactions WHERE article_id = $1', [article.news_id]);
        await miaPool.query('DELETE FROM user_article_tags WHERE article_id = $1', [article.news_id]);

        // Then delete the article
        await miaPool.query('DELETE FROM news_article WHERE news_id = $1', [article.news_id]);
        deleted++;
        if (verboseMode) {
          console.log(`  ✓ Deleted article ${article.news_id}: ${article.title?.substring(0, 40)}...`);
        }
      } catch (error) {
        failed++;
        console.error(`  ✗ Failed to delete article ${article.news_id}:`, error.message);
      }
    } else if (deleteMode) {
      console.log(`  [DRY-RUN] Would delete article ${article.news_id}: ${article.title?.substring(0, 40)}...`);
      deleted++;
    }
  }

  return { deleted, failed };
}

// ====== Main Execution ======

async function main() {
  try {
    // Find problematic articles
    const problematicArticles = await findProblematicArticles();

    if (problematicArticles.length === 0) {
      console.log('✅ No problematic articles found! Database is clean.\n');
      return;
    }

    // Report findings
    console.log('\n' + '='.repeat(70));
    console.log('                    PROBLEMATIC ARTICLES FOUND');
    console.log('='.repeat(70) + '\n');

    // Group by issue type
    const byIssue = {};
    const sueddeutscheArticles = [];

    for (const article of problematicArticles) {
      if (article.is_sueddeutsche) {
        sueddeutscheArticles.push(article);
      }

      for (const problem of article.problems) {
        for (const issue of problem.issues) {
          if (!byIssue[issue]) byIssue[issue] = [];
          if (!byIssue[issue].find(a => a.news_id === article.news_id)) {
            byIssue[issue].push(article);
          }
        }
      }
    }

    console.log('📈 Issue Summary:\n');
    for (const [issue, articles] of Object.entries(byIssue)) {
      console.log(`  • ${issue}: ${articles.length} articles`);
    }

    if (sueddeutscheArticles.length > 0) {
      console.log(`\n  🇩🇪 Süddeutsche Zeitung articles with issues: ${sueddeutscheArticles.length}`);
    }

    // Show detailed list
    if (verboseMode || problematicArticles.length <= 20) {
      console.log('\n\n📋 Detailed Article List:\n');

      for (const article of problematicArticles) {
        console.log(`\n  ${article.is_sueddeutsche ? '🇩🇪' : '📰'} ${article.news_id}`);
        console.log(`     Title: ${article.title?.substring(0, 60)}...`);
        console.log(`     Source: ${article.source}`);
        console.log(`     Date: ${article.published_at}`);
        console.log(`     Problems:`);
        for (const problem of article.problems) {
          console.log(`       - ${problem.field}: ${problem.issues.join(', ')}`);
          if (verboseMode) {
            console.log(`         Sample: "${problem.sample}..."`);
          }
        }
      }
    }

    // Perform cleanup
    console.log('\n' + '='.repeat(70));
    console.log('                      CLEANUP OPERATIONS');
    console.log('='.repeat(70));

    // Clear translations
    const clearResult = await clearTranslations(problematicArticles);
    console.log(`\n📝 Translation Clearing: ${clearResult.cleared} articles ${executeMode ? 'cleared' : 'would be cleared'}`);
    if (clearResult.failed > 0) {
      console.log(`   ⚠️  ${clearResult.failed} articles failed`);
    }

    // Delete articles if requested
    if (deleteMode) {
      const deleteResult = await deleteArticles(problematicArticles);
      console.log(`\n🗑️  Article Deletion: ${deleteResult.deleted} articles ${executeMode ? 'deleted' : 'would be deleted'}`);
      if (deleteResult.failed > 0) {
        console.log(`   ⚠️  ${deleteResult.failed} articles failed`);
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(70));
    console.log('                         SUMMARY');
    console.log('='.repeat(70));
    console.log(`
  Total problematic articles found: ${problematicArticles.length}
  Süddeutsche Zeitung articles: ${sueddeutscheArticles.length}
  Translations cleared: ${clearResult.cleared}
  ${deleteMode ? `Articles deleted: ${deleteMode && executeMode ? 'see above' : 'N/A (dry-run)'}` : ''}

  ${!executeMode ? '⚠️  This was a DRY-RUN. No changes were made.' : '✅ Cleanup completed!'}
  ${!executeMode ? '    Run with --execute to apply changes.' : ''}
  ${!deleteMode ? '    Add --delete to also delete severely problematic articles.' : ''}
`);

    // Output cleanup SQL for manual execution
    if (!executeMode && problematicArticles.length > 0) {
      console.log('\n📜 SQL for manual cleanup:\n');
      console.log('-- Clear translations for problematic articles');
      for (const article of problematicArticles.slice(0, 10)) {
        const fieldsToNull = [];
        for (const problem of article.problems) {
          if ((problem.field === 'title_zh' || problem.field === 'summary_zh') &&
              !fieldsToNull.includes(problem.field)) {
            fieldsToNull.push(problem.field);
          }
        }
        if (fieldsToNull.length > 0) {
          const setClause = fieldsToNull.map(f => `${f} = NULL`).join(', ');
          console.log(`UPDATE news_article SET ${setClause}, updated_at = NOW() WHERE news_id = '${article.news_id}';`);
        }
      }
      if (problematicArticles.length > 10) {
        console.log(`-- ... and ${problematicArticles.length - 10} more articles`);
      }
    }

  } catch (error) {
    console.error('\n❌ Error during cleanup:', error);
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
