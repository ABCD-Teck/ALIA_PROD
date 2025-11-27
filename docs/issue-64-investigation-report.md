# Issue #64 Investigation Report
## News Only Updated to October 17

**Issue Opened:** 2025-11-09 by @kevinliu81
**Assignees:** @AdrienSterling, @CHENn3bula
**Investigation Date:** 2025-11-10
**Status:** Root Cause Identified

---

## Executive Summary

The news articles in the Market Insights section have not been updated since **October 18, 2024**. Investigation confirms that:
- ❌ **NO automated daily pipeline exists**
- ❌ **Required MIA project directory is missing**
- ✅ Manual pipeline API infrastructure exists but is not configured for automation

**Impact:** Users see stale news data, reducing the value of the Market Insights feature.

---

## Database Investigation Results

### Query Executed
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

### Key Findings

#### Statistics
- **Total Articles:** 1,499
- **Latest `published_at`:** December 3, 2025 (data quality issue - likely incorrect year)
- **Latest `created_at`:** October 18, 2025 at 01:21:38
- **All articles created on same timestamp:** YES ⚠️

#### Articles by Month
| Month | Count |
|-------|-------|
| 2025-12 | 1 article |
| 2025-10 | 1,446 articles |
| 2025-09 | 52 articles |

### Critical Discovery
**ALL 1,499 articles share the same `created_at` timestamp: October 18, 2025 01:21:38**

This indicates:
1. A one-time bulk import occurred on October 18
2. No updates have occurred since October 18
3. The pipeline has been dormant for ~3 weeks

---

## Pipeline Architecture Analysis

### Current Infrastructure

#### 1. Database
- **Location:** AWS RDS (eu-central-1)
- **Host:** `abcdteck-ce.cdggcuqweof7.eu-central-1.rds.amazonaws.com`
- **Database:** `mia_insights`
- **Table:** `news_article`
- **Status:** ✅ Accessible and functioning

#### 2. API Endpoints (server/routes/miaPipeline.js)

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/mia-pipeline/trigger` | POST | Manual pipeline trigger | ✅ Exists |
| `/api/mia-pipeline/status/:jobId` | GET | Check job status | ✅ Exists |
| `/api/mia-pipeline/jobs` | GET | List all jobs | ✅ Exists |
| `/api/mia-pipeline/auto-refresh` | POST | Auto-refresh companies | ✅ Exists |
| `/api/mia-pipeline/test` | POST | Test connectivity | ✅ Exists |

#### 3. External Dependencies

**MIA Project:**
- **Expected Path:** `C:\Users\N3BULA\Desktop\MIA`
- **Status:** ❌ **NOT FOUND**
- **Python Script:** `etl/by_company_ingest.py`
- **Python Environment:** `.venv\Scripts\python`

**Configuration (.env):**
```env
MIA_PROJECT_PATH=C:\Users\N3BULA\Desktop\MIA
PYTHON_VENV_PATH=.venv\Scripts\python
```

---

## Root Cause Analysis

### Why News Stopped Updating

1. **Missing MIA Project**
   - The pipeline depends on Python ETL scripts in the MIA project
   - The MIA project directory does not exist on the server
   - Without this, the pipeline cannot fetch new news articles

2. **No Automated Scheduling**
   - The pipeline API only supports manual triggering
   - No cron job exists to run daily/weekly
   - No scheduled tasks configured
   - Relies on manual intervention

3. **Last Manual Trigger**
   - Someone manually triggered the pipeline on October 18
   - 1,499 articles were successfully ingested
   - No one has triggered it since
   - No alerts/monitoring to detect pipeline inactivity

---

## Impact Assessment

### User Impact
- **Severity:** HIGH
- **Affected Feature:** Market Insights - News section
- **User Experience:** Stale data reduces trust and value
- **Business Impact:** Reduced engagement with Market Insights

### Data Quality Issues
1. **Stale News:** 3+ weeks old
2. **Date Inconsistencies:** Some articles show future dates (2025-12-03)
3. **Incomplete Coverage:** Only October articles, missing November data

---

## Recommended Solutions

### Option 1: Restore MIA Project & Set Up Automation (RECOMMENDED)

**Prerequisites:**
1. Locate or restore the MIA project
2. Verify Python environment and dependencies
3. Test the ETL pipeline manually

**Implementation Steps:**

#### Step 1: Restore MIA Project
```bash
# If MIA project exists elsewhere, copy it
cp -r /path/to/MIA C:\Users\N3BULA\Desktop\MIA

# Or clone from repository (if exists)
git clone <mia-repo-url> C:\Users\N3BULA\Desktop\MIA
```

#### Step 2: Test Pipeline
```bash
# Test connectivity
curl -X POST http://localhost:3001/api/mia-pipeline/test

# Trigger for single company
curl -X POST http://localhost:3001/api/mia-pipeline/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "companies": ["BYD"],
    "perCompany": 5
  }'
```

#### Step 3: Set Up Daily Automation

**Option A: Node-cron (Within Application)**

Create `server/scheduled/newsUpdater.js`:
```javascript
const cron = require('node-cron');
const axios = require('axios');

// Run daily at 6 AM
cron.schedule('0 6 * * *', async () => {
  console.log('[News Updater] Running daily news update...');

  try {
    // Get list of active companies from database
    const companies = await getActiveCompanies();

    // Trigger pipeline
    const response = await axios.post('http://localhost:3001/api/mia-pipeline/trigger', {
      companies,
      perCompany: 10
    });

    console.log('[News Updater] Pipeline triggered:', response.data.jobId);
  } catch (error) {
    console.error('[News Updater] Failed to trigger pipeline:', error.message);
    // Send alert to team
  }
});
```

Add to `server/index.js`:
```javascript
require('./scheduled/newsUpdater');
```

**Option B: System Cron Job (Linux/Mac)**
```bash
# Add to crontab
0 6 * * * cd /path/to/ALIA_PROD && node server/scripts/updateNews.js >> logs/news-update.log 2>&1
```

**Option C: Windows Task Scheduler**
- Create scheduled task to run daily at 6 AM
- Action: Run `node server/scripts/updateNews.js`
- Working directory: `C:\Users\N3BULA\Desktop\ALIA_PROD`

---

### Option 2: Build Alternative News Fetching System

If MIA project cannot be restored, create a standalone news fetcher.

**Implementation:**

Create `server/services/newsFetcher.js`:
```javascript
const axios = require('axios');
const miaPool = require('../db-mia');

class NewsFetcher {
  constructor() {
    // Use news APIs like NewsAPI, Google News API, or RSS feeds
    this.apiKey = process.env.NEWS_API_KEY;
    this.sources = ['reuters', 'bloomberg', 'wsj', 'ft'];
  }

  async fetchLatestNews() {
    // Fetch from news APIs
    // Process and categorize
    // Store in news_article table
  }
}

module.exports = NewsFetcher;
```

**Pros:**
- Independent of MIA project
- Can use multiple news sources
- Easier to maintain

**Cons:**
- Requires API subscriptions ($)
- May not match existing categorization
- Need to rebuild ETL logic

---

### Option 3: Manual Weekly Updates (Temporary)

Until automation is implemented:
1. Create documentation for manual pipeline triggering
2. Schedule weekly reminder for team
3. Create monitoring dashboard for pipeline status

---

## Monitoring & Alerting Recommendations

### 1. Add Health Check Endpoint

Create `server/routes/healthCheck.js`:
```javascript
router.get('/health/news-freshness', async (req, res) => {
  const result = await miaPool.query(`
    SELECT
      MAX(created_at) as latest_update,
      COUNT(*) as total_articles,
      EXTRACT(DAY FROM NOW() - MAX(created_at)) as days_since_update
    FROM news_article
  `);

  const daysSinceUpdate = result.rows[0].days_since_update;

  res.json({
    status: daysSinceUpdate > 7 ? 'warning' : 'ok',
    latest_update: result.rows[0].latest_update,
    days_since_update: daysSinceUpdate,
    total_articles: result.rows[0].total_articles
  });
});
```

### 2. Set Up Alerts
- Slack/Email notification if no updates in 7 days
- Dashboard showing last update time
- Weekly report of pipeline activity

---

## Action Items

### Immediate (This Week)
- [ ] **Locate MIA project** or confirm it's not recoverable
- [ ] **Test pipeline** with sample company
- [ ] **Document manual trigger process** for team

### Short-term (Next 2 Weeks)
- [ ] **Implement automated scheduling** (Option 1 or 2)
- [ ] **Set up monitoring** and alerts
- [ ] **Run initial update** to catch up on missing news

### Long-term (Next Month)
- [ ] **Implement health checks** for all data pipelines
- [ ] **Create admin dashboard** for pipeline management
- [ ] **Document troubleshooting** procedures

---

## Technical Debt Identified

1. **No Pipeline Monitoring:** Silent failures go unnoticed
2. **No Error Alerts:** Team not notified when pipeline fails
3. **Single Point of Dependency:** Relies on external MIA project
4. **No Documentation:** No runbook for pipeline operations
5. **No Data Quality Checks:** Date inconsistencies not caught

---

## Questions for Stakeholders

1. **MIA Project:** Where is the original MIA project? Can it be restored?
2. **Update Frequency:** How often should news be updated? (Daily/Weekly)
3. **Budget:** Is there budget for commercial news APIs if MIA project unavailable?
4. **Priority:** What's the timeline for fixing this issue?

---

## Conclusion

The news update pipeline stopped because:
1. It requires manual triggering (no automation)
2. The external MIA project is missing
3. No monitoring detected the issue for 3 weeks

**Recommended Next Steps:**
1. Restore or rebuild the news ingestion pipeline
2. Implement automated daily scheduling
3. Add monitoring and alerting
4. Create documentation for team

**Timeline Estimate:**
- **With MIA Project:** 2-3 days
- **Without MIA Project:** 1-2 weeks (build alternative)

---

**Report Prepared By:** Claude Code (AI Assistant)
**Date:** 2025-11-10
**For Questions:** Contact @AdrienSterling or @CHENn3bula
