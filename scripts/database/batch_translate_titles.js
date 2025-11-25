/**
 * Batch Translate Missing Chinese Titles
 *
 * This script finds all news articles without Chinese titles
 * and translates them using the OpenAI API.
 *
 * Usage: node scripts/database/batch_translate_titles.js [--limit N] [--dry-run]
 */

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

// Initialize OpenAI only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  const OpenAI = require('openai');
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Parse command line arguments
const args = process.argv.slice(2);
const limitArg = args.indexOf('--limit');
const BATCH_LIMIT = limitArg !== -1 ? parseInt(args[limitArg + 1]) : 100;
const DRY_RUN = args.includes('--dry-run');

// Rate limiting: wait between API calls
const DELAY_MS = 500;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function translateText(text) {
  if (!openai) {
    console.error('OpenAI API key not configured. Cannot translate.');
    return null;
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator specializing in financial and business news. Translate the following English title to Chinese. Keep it concise and natural. Only return the translated text, nothing else.'
        },
        {
          role: 'user',
          content: text
        }
      ],
      max_tokens: 200,
      temperature: 0.3
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error(`Translation error for "${text}":`, error.message);
    return null;
  }
}

async function batchTranslateTitles() {
  console.log('='.repeat(60));
  console.log('Batch Translate Missing Chinese Titles');
  console.log('='.repeat(60));
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes will be made)' : 'LIVE'}`);
  console.log(`Batch Limit: ${BATCH_LIMIT}`);
  console.log(`OpenAI API: ${openai ? 'Configured' : 'NOT CONFIGURED'}`);
  console.log('');

  // Check if we can translate (not dry-run and no API key)
  if (!DRY_RUN && !openai) {
    console.error('ERROR: OpenAI API key is required for live translation.');
    console.error('Please set OPENAI_API_KEY in your .env file or use --dry-run mode.');
    process.exit(1);
  }

  try {
    // Count total articles without Chinese titles
    const countQuery = `
      SELECT COUNT(*) as total
      FROM news_article
      WHERE has_text = true
        AND (title_zh IS NULL OR title_zh = '' OR title_zh = title)
    `;
    const countResult = await miaPool.query(countQuery);
    const totalMissing = parseInt(countResult.rows[0].total);

    console.log(`Total articles missing Chinese titles: ${totalMissing}`);
    console.log(`Processing up to ${Math.min(BATCH_LIMIT, totalMissing)} articles...`);
    console.log('');

    // Fetch articles without Chinese titles
    const selectQuery = `
      SELECT news_id, title
      FROM news_article
      WHERE has_text = true
        AND (title_zh IS NULL OR title_zh = '' OR title_zh = title)
      ORDER BY published_at DESC
      LIMIT $1
    `;
    const result = await miaPool.query(selectQuery, [BATCH_LIMIT]);

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < result.rows.length; i++) {
      const article = result.rows[i];
      const progress = `[${i + 1}/${result.rows.length}]`;

      // Skip if title is empty or too short
      if (!article.title || article.title.trim().length < 3) {
        console.log(`${progress} SKIP: Empty or too short title (ID: ${article.news_id})`);
        skippedCount++;
        continue;
      }

      // Check if title is already in Chinese (contains Chinese characters)
      if (/[\u4e00-\u9fa5]/.test(article.title)) {
        console.log(`${progress} SKIP: Title already in Chinese (ID: ${article.news_id})`);
        skippedCount++;

        // Update title_zh to same as title since it's already Chinese
        if (!DRY_RUN) {
          await miaPool.query(
            'UPDATE news_article SET title_zh = title WHERE news_id = $1',
            [article.news_id]
          );
        }
        continue;
      }

      console.log(`${progress} Translating: "${article.title.substring(0, 50)}..."`);

      if (DRY_RUN) {
        console.log(`         -> [DRY RUN] Would translate this title`);
        successCount++;
        continue;
      }

      const translatedTitle = await translateText(article.title);

      if (translatedTitle) {
        // Update database
        const updateQuery = `
          UPDATE news_article
          SET title_zh = $1, updated_at = CURRENT_TIMESTAMP
          WHERE news_id = $2
        `;
        await miaPool.query(updateQuery, [translatedTitle, article.news_id]);

        console.log(`         -> "${translatedTitle}"`);
        successCount++;
      } else {
        console.log(`         -> ERROR: Translation failed`);
        errorCount++;
      }

      // Rate limiting
      await sleep(DELAY_MS);
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('Summary:');
    console.log(`  Successfully translated: ${successCount}`);
    console.log(`  Skipped: ${skippedCount}`);
    console.log(`  Errors: ${errorCount}`);
    console.log(`  Remaining (not processed): ${Math.max(0, totalMissing - result.rows.length)}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await miaPool.end();
  }
}

// Run the script
batchTranslateTitles();
