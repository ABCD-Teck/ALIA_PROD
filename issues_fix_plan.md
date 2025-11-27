# GitHub Issues Fix Plan - ALIA_PROD

## Overview
This document provides detailed implementation steps for fixing open GitHub issues in the ALIA_PROD project. Each issue includes the root cause analysis, affected files, and step-by-step implementation instructions.

---

## Issue #66: Customer List Serial Number Should Start from 1
**Priority:** High
**Status:** Open
**Type:** Bug
**Labels:** None

### Description
The customer list in the Dashboard displays serial numbers starting from 0. It should start from 1 for better UX consistency.

### Root Cause
In `Dashboard.tsx` line 351, the serial number is calculated as `{startIndex + index}` which starts from 0 when the index is 0.

### Affected Files
- `src/components/pages/Dashboard.tsx`

### Implementation Steps

#### Step 1: Locate the issue
1. Open `src/components/pages/Dashboard.tsx`
2. Navigate to line 351
3. Find the table cell rendering the serial number:
```tsx
<td className="py-4 px-4 text-sm text-gray-900">{startIndex + index}</td>
```

#### Step 2: Fix the calculation
Replace line 351 with:
```tsx
<td className="py-4 px-4 text-sm text-gray-900">{startIndex + index + 1}</td>
```

#### Step 3: Testing
1. Start the development server: `npm run dev`
2. Navigate to the Dashboard (homepage)
3. Verify that the customer list now starts from 1
4. Test pagination to ensure numbers continue correctly (e.g., page 2 should start from 11 if 10 items per page)
5. Test with search/filter to ensure numbering remains correct

#### Expected Outcome
- First customer in the list shows "1" instead of "0"
- Pagination maintains correct numbering sequence
- Search/filter results maintain correct numbering

---

## Issue #67: Customer List Click Should Navigate to Customer Page
**Priority:** Medium
**Status:** Open
**Type:** Feature Request
**Labels:** medium

### Description
When clicking on a customer item in the customer list on the homepage, it should navigate to the corresponding customer insights page. Currently, only double-click works.

### Root Cause
In `Dashboard.tsx` lines 347-349, the navigation is triggered by `onDoubleClick` event instead of `onClick`.

### Affected Files
- `src/components/pages/Dashboard.tsx`

### Implementation Steps

#### Step 1: Locate the issue
1. Open `src/components/pages/Dashboard.tsx`
2. Navigate to lines 343-350
3. Find the table row implementation:
```tsx
<tr
  key={customer.customer_id}
  className="border-b hover:bg-green-50 cursor-pointer transition-colors"
  onDoubleClick={() => {
    navigate(`/customer-insights/${customer.customer_id}`);
  }}
>
```

#### Step 2: Change event handler
Replace `onDoubleClick` with `onClick`:
```tsx
<tr
  key={customer.customer_id}
  className="border-b hover:bg-green-50 cursor-pointer transition-colors"
  onClick={() => {
    navigate(`/customer-insights/${customer.customer_id}`);
  }}
>
```

#### Step 3: Testing
1. Start the development server: `npm run dev`
2. Navigate to the Dashboard (homepage)
3. Single-click on any customer row
4. Verify that it navigates to the customer insights page with the correct customer ID
5. Verify the URL format: `/customer-insights/{customer_id}`
6. Test with multiple customers to ensure consistent behavior

#### Expected Outcome
- Single-click on customer row navigates to customer insights page
- Correct customer data loads on the insights page
- Hover effect still works (green background on hover)

---

## Issue #65: Customer Insights - Debt Ratio vs Debt/Equity Ratio
**Priority:** Medium
**Status:** Open
**Type:** Question
**Labels:** question

### Description
Need clarification on whether to display "负债率" (debt ratio) or "债务股本比" (Debt/Equity Ratio) in the key financial indicators section. The issue suggests that Debt/Equity Ratio can be directly obtained from Investing.com.

### Questions to Resolve
1. Which metric should be displayed: Debt Ratio or Debt/Equity Ratio?
2. What is the current data source for the debt metric?
3. Is there an existing integration with Investing.com?

### Investigation Steps

#### Step 1: Review current implementation
1. Open `src/components/pages/CustomerInsights.tsx`
2. Search for "debt" or "负债率" to find where it's displayed
3. Check lines 100-104 for the financial statement data structure:
```tsx
debt_ratio: '',
```

#### Step 2: Review API and data source
1. Open `server/routes/financialStatements.js`
2. Check the database schema for financial data
3. Identify current data source (Investing.com, manual entry, or other)
4. Check if there's a `debt_equity_ratio` field in the database

#### Step 3: Review backend migration files
1. Navigate to `server/migrations/`
2. Find the financial_statement table schema
3. Verify which fields exist: `debt_ratio`, `debt_equity_ratio`, or both

### Recommended Implementation (pending clarification)

**Option A: Keep current Debt Ratio**
- No code changes required
- Document the calculation method
- Ensure data source is clearly identified

**Option B: Switch to Debt/Equity Ratio**

#### If switching is approved:

**Frontend Changes:**
1. Update `src/components/pages/CustomerInsights.tsx`:
   - Line ~160: Update translation key `debtRatio` to `debtEquityRatio`
   - Update Chinese text: "负债率" → "债务股本比"
   - Update English text: "Debt Ratio" → "Debt/Equity Ratio"

2. Update financial form:
   - Line ~100: Change `debt_ratio` to `debt_equity_ratio`
   - Update form labels and placeholders

**Backend Changes:**
1. Create database migration in `server/migrations/`:
```sql
-- Add new column
ALTER TABLE financial_statement ADD COLUMN debt_equity_ratio NUMERIC(10, 2);

-- Optional: Migrate existing data if conversion formula is available
-- UPDATE financial_statement SET debt_equity_ratio = ...

-- Optional: Deprecate old column
ALTER TABLE financial_statement DROP COLUMN debt_ratio;
```

2. Update `server/routes/financialStatements.js`:
   - Replace all references to `debt_ratio` with `debt_equity_ratio`
   - Update validation rules if needed

3. If integrating with Investing.com:
   - Create new service in `server/services/` for Investing.com API
   - Implement data fetching for Debt/Equity Ratio
   - Add cron job or scheduled task to update data periodically

**Testing:**
1. Verify UI displays correct metric name
2. Test data entry and editing
3. Verify API returns correct field
4. Test data visualization in charts
5. Verify migration doesn't lose existing data

### Action Required
**Before implementing, get clarification from stakeholders (kevinliu81) on:**
1. Which metric to use
2. Whether to integrate with Investing.com
3. How to handle historical data (if switching metrics)

---

## Issue #64: News Insights - News Only Updated to October 17?
**Priority:** High
**Status:** Open
**Type:** Question
**Labels:** question
**Assignees:** AdrienSterling, CHENn3bula

### Description
News in the Market Insights section appears to only be updated until October 17. Need to verify if there's a backend process that updates news daily.

### Root Cause Analysis Required
This is likely a backend data pipeline issue rather than a frontend bug.

### Investigation Steps

#### Step 1: Check database for recent news
1. Connect to the PostgreSQL database:
```bash
export PGPASSWORD=ABCDTeck2025
psql -h localhost -U postgres -d alia
```

2. Run query to check latest news:
```sql
SELECT
  news_id,
  title,
  published_at,
  source,
  created_at
FROM news_article
ORDER BY published_at DESC
LIMIT 20;
```

3. Check the most recent `published_at` date
4. Compare with current date to confirm gap

#### Step 2: Review API implementation
1. Open `server/routes/marketInsights.js`
2. Check line 200: `ORDER BY na.published_at DESC`
3. Verify the API is correctly returning articles sorted by publish date
4. Check if there are any date filters limiting results

#### Step 3: Check for data pipeline scripts
1. Look for scripts in `server/scripts/` directory
2. Check for cron jobs or scheduled tasks:
```bash
# On server, check crontab
crontab -l

# Check for systemd timers
systemctl list-timers
```

3. Search for news scraping/fetching scripts:
```bash
cd server/scripts
ls -la *news* *article* *scrape* *fetch*
```

#### Step 4: Review external data source integration
1. Check if there's integration with news APIs
2. Common sources might be:
   - RSS feeds
   - News APIs (NewsAPI, Google News, etc.)
   - Web scraping scripts
3. Look for API keys in `.env` file related to news services

#### Step 5: Check service files
1. Navigate to `server/services/`
2. Look for news-related services:
```bash
cd server/services
ls -la *news* *article*
```

3. Review service code for data fetching logic

### Recommended Implementation

#### Solution 1: If no automated pipeline exists - CREATE ONE

**Step 1: Create news fetching service**
Create `server/services/newsFetcher.js`:
```javascript
const axios = require('axios');
const db = require('../db');

class NewsFetcher {
  constructor() {
    this.apiKey = process.env.NEWS_API_KEY;
    this.sources = ['reuters', 'bloomberg', 'wsj']; // Configure as needed
  }

  async fetchLatestNews() {
    try {
      // Implement news API integration
      // Example: NewsAPI, Google News API, or RSS parser
      const articles = await this.fetchFromAPI();

      // Process and store in database
      for (const article of articles) {
        await this.storeArticle(article);
      }

      console.log(`[News Fetcher] Successfully fetched ${articles.length} articles`);
    } catch (error) {
      console.error('[News Fetcher] Error fetching news:', error);
      throw error;
    }
  }

  async fetchFromAPI() {
    // Implement API integration based on chosen news provider
    // Return array of article objects
  }

  async storeArticle(article) {
    const query = `
      INSERT INTO news_article (
        title, url, published_at, source,
        summary_en, text, has_text, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (url) DO UPDATE SET
        title = EXCLUDED.title,
        published_at = EXCLUDED.published_at,
        updated_at = NOW()
      RETURNING news_id
    `;

    await db.query(query, [
      article.title,
      article.url,
      article.publishedAt,
      article.source,
      article.summary,
      article.content,
      true
    ]);
  }
}

module.exports = NewsFetcher;
```

**Step 2: Create scheduled task**
Create `server/scripts/updateNews.js`:
```javascript
const NewsFetcher = require('../services/newsFetcher');

async function updateNews() {
  console.log('[Update News] Starting news update...');
  const fetcher = new NewsFetcher();

  try {
    await fetcher.fetchLatestNews();
    console.log('[Update News] News update completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('[Update News] Failed to update news:', error);
    process.exit(1);
  }
}

updateNews();
```

**Step 3: Set up cron job**
Add to crontab (run daily at 6 AM):
```bash
0 6 * * * cd /path/to/ALIA_PROD/server && node scripts/updateNews.js >> logs/news-update.log 2>&1
```

Or use node-cron in `server/index.js`:
```javascript
const cron = require('node-cron');
const NewsFetcher = require('./services/newsFetcher');

// Run daily at 6 AM
cron.schedule('0 6 * * *', async () => {
  console.log('[Cron] Running daily news update...');
  const fetcher = new NewsFetcher();
  try {
    await fetcher.fetchLatestNews();
  } catch (error) {
    console.error('[Cron] News update failed:', error);
  }
});
```

**Step 4: Update package.json**
Add dependencies:
```bash
npm install node-cron axios rss-parser
```

**Step 5: Add configuration**
Update `.env`:
```bash
NEWS_API_KEY=your_api_key_here
NEWS_FETCH_INTERVAL=24 # hours
NEWS_MAX_ARTICLES=100
```

#### Solution 2: If pipeline exists but is broken - FIX IT

1. Identify the broken component in the existing pipeline
2. Check logs for error messages
3. Verify API credentials are still valid
4. Check rate limits or quota issues
5. Fix the identified issue and restart the service

### Testing

**After implementation:**
1. Run the update script manually:
```bash
node server/scripts/updateNews.js
```

2. Check database for new articles:
```sql
SELECT COUNT(*) as recent_articles
FROM news_article
WHERE published_at > NOW() - INTERVAL '7 days';
```

3. Verify frontend displays new articles:
   - Navigate to Market Insights page
   - Check that latest news appears
   - Verify dates are recent

4. Monitor logs:
```bash
tail -f logs/news-update.log
```

5. Set up monitoring/alerting for pipeline failures

### Expected Outcome
- News articles are automatically fetched daily
- Database contains articles with recent `published_at` dates
- Frontend displays news from the past 24-48 hours
- System logs show successful daily updates

---

## Implementation Priority

### Immediate (Quick Fixes - 30 minutes)
1. **Issue #66** - Customer list serial number (1 line change)
2. **Issue #67** - Customer list click navigation (1 line change)

### Short-term (Requires Clarification - 1-2 days after approval)
3. **Issue #65** - Debt ratio metric (requires stakeholder decision)

### Medium-term (Requires Investigation & Development - 3-5 days)
4. **Issue #64** - News update pipeline (requires backend investigation and potential development)

---

## General Testing Checklist

After implementing any fix:
- [ ] Code changes are minimal and focused
- [ ] No console errors in browser
- [ ] No server errors in logs
- [ ] Feature works in both English and Chinese
- [ ] Responsive design is maintained
- [ ] Database queries are optimized
- [ ] No breaking changes to existing functionality
- [ ] Code follows project conventions
- [ ] Relevant documentation is updated

---

## Rollback Plan

If any fix causes issues:

1. **Frontend fixes (#66, #67):**
   ```bash
   git revert <commit-hash>
   npm run build
   ```

2. **Backend fixes (#64, #65):**
   ```bash
   # Revert code
   git revert <commit-hash>

   # Revert database migration if needed
   npm run migrate:down

   # Restart server
   npm run server:restart
   ```

3. **Database issues:**
   - Restore from latest backup
   - Verify data integrity
   - Re-run migrations if needed

---

## Notes for Developers

### Code Locations Quick Reference
- **Dashboard/Homepage:** `src/components/pages/Dashboard.tsx`
- **Customer Insights:** `src/components/pages/CustomerInsights.tsx`
- **Market Insights:** `src/components/pages/MarketInsights.tsx`
- **API Routes:** `server/routes/`
- **Database Migrations:** `server/migrations/`
- **Services:** `server/services/`

### Database Connection
```bash
# Development
export PGPASSWORD=ABCDTeck2025
psql -h localhost -U postgres -d alia

# Check table schema
\d+ financial_statement
\d+ news_article
\d+ customer
```

### Running the Application
```bash
# Frontend (port 5173)
npm run dev

# Backend (port 3001)
npm run server

# Both concurrently
npm start
```

### Useful Commands
```bash
# View logs
tail -f logs/server.log

# Check process
ps aux | grep node

# Database backup
pg_dump -U postgres alia > backup_$(date +%Y%m%d).sql

# Run specific migration
node server/run-migration.js <migration-name>
```

---

## Contact & Questions

For clarifications or questions about implementation:
- Issue #65, #64: Contact @kevinliu81
- Technical issues: Contact @AdrienSterling or @CHENn3bula
- General questions: Create comment on respective GitHub issue

---

**Last Updated:** 2025-11-10
**Document Version:** 1.0
**Author:** Claude Code (AI Assistant)
